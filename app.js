const $=id=>document.getElementById(id);
const STORE="marcus-studio-v1";
const defaults={memories:[],examples:[],evaluations:[],model:{endpoint:"",id:""},systemPrompt:"You are Marcus, a helpful assistant. Be accurate, explain your reasoning clearly, and admit uncertainty.",created:new Date().toISOString()};
let data=loadData(),drafts=[];
let modelKey=sessionStorage.getItem("marcus-model-key")||"",groqKey=sessionStorage.getItem("marcus-groq-key")||"",groqModel=sessionStorage.getItem("marcus-groq-model")||"openai/gpt-oss-20b";
if(groqModel==="llama-3.3-70b-versatile"||groqModel==="llama-3.1-8b-instant")groqModel="openai/gpt-oss-20b";
function loadData(){try{return {...defaults,...JSON.parse(localStorage.getItem(STORE)||"{}")}}catch{return {...defaults}}}
function save(){localStorage.setItem(STORE,JSON.stringify(data));renderStats()}
function toast(s){$("toast").textContent=s;$("toast").classList.add("show");setTimeout(()=>$("toast").classList.remove("show"),3500)}
function status(s){$("statusText").textContent=s}
function esc(s=""){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function go(tab){document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("active",b.dataset.tab===tab));document.querySelectorAll(".panel").forEach(p=>p.classList.toggle("active",p.id===tab));}
document.querySelectorAll("[data-tab]").forEach(b=>b.addEventListener("click",()=>go(b.dataset.tab)));
function renderStats(){$("memoryCount").textContent=data.memories.length;$("exampleCount").textContent=data.examples.length;$("evalCount").textContent=data.evaluations.length;$("memoryListCount").textContent=data.memories.length;$("exampleListCount").textContent=data.examples.length;$("evalListCount").textContent=data.evaluations.length;$("modelStatus").textContent=data.model.endpoint?"Configured":"Not connected";$("modelLabel").textContent=data.model.id||"Set an endpoint"}
function renderList(id,items,type){const box=$(id);if(!items.length){box.className="items empty";box.textContent="Nothing here yet.";return}box.className="items";box.innerHTML=items.map((x,i)=>'<article class="item"><div class="item-top"><div><h4>'+esc(x.title||x.prompt||x.question||("Record "+(i+1)))+'</h4><p>'+esc(x.content||x.answer||x.actual||"")+'</p>'+(x.expected?'<p><b>Ideal:</b> '+esc(x.expected)+'</p>':"")+(x.category?'<span class="pill">'+esc(x.category)+'</span>':"")+'</div><button class="delete" data-del="'+type+'" data-i="'+i+'">Delete</button></div></article>').join("")}
function render(){renderStats();renderList("memoryList",data.memories,"memory");renderList("exampleList",data.examples,"example");renderList("evalList",data.evaluations,"evaluation")}
document.addEventListener("click",e=>{const b=e.target.closest("[data-del]");if(!b)return;const key={memory:"memories",example:"examples",evaluation:"evaluations"}[b.dataset.del];data[key].splice(Number(b.dataset.i),1);save();render();toast("Record deleted.")});
$("modelEndpoint").value=data.model.endpoint||"";$("modelId").value=data.model.id||"";$("modelKey").value=modelKey;$("groqKey").value=groqKey;$("groqModel").value=groqModel;
$("saveModel").onclick=()=>{data.model={endpoint:$("modelEndpoint").value.trim().replace(/\/$/,""),id:$("modelId").value.trim()};modelKey=$("modelKey").value.trim();sessionStorage.setItem("marcus-model-key",modelKey);save();toast("Model connection saved in this browser.")};
$("saveGroq").onclick=()=>{groqKey=$("groqKey").value.trim();groqModel=$("groqModel").value.trim()||"llama-3.3-70b-versatile";sessionStorage.setItem("marcus-groq-key",groqKey);sessionStorage.setItem("marcus-groq-model",groqModel);toast("Groq helper key saved for this browser session.")};

async function askMarcus(messages){if(!data.model.endpoint)throw Error("Marcus is hosted remotely. Configure the hosted model endpoint first.");return api(data.model.endpoint,modelKey,data.model.id,messages)}
async function api(endpoint,key,model,messages){if(!endpoint)throw Error("Add an endpoint URL first.");const r=await fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/json",...(key?{Authorization:"Bearer "+key}:{})},body:JSON.stringify({model,messages,temperature:.3})});const body=await r.json().catch(()=>({}));if(!r.ok)throw Error(body.error?.message||"Request failed ("+r.status+"). Check endpoint, model ID, key, and CORS.");return body.choices?.[0]?.message?.content||JSON.stringify(body)}
async function groq(messages){if(!groqKey)throw Error("Add your Groq API key in Model connection first.");return api("https://api.groq.com/openai/v1/chat/completions",groqKey,groqModel,messages)}
function contextMessages(prompt){const memory=data.memories.slice(-40).map(m=>m.title+": "+m.content).join("\n");const ex=data.examples.slice(-8).map(x=>"Question: "+x.prompt+"\nIdeal answer: "+x.answer).join("\n\n");return [{role:"system",content:data.systemPrompt+"\n\nTeaching memories:\n"+(memory||"(none)")+"\n\nReference examples:\n"+(ex||"(none)")},{role:"user",content:prompt}]}
$("testModel").onclick=async()=>{try{$("saveModel").click();status("Testing model…");const a=await api(data.model.endpoint,modelKey,data.model.id,[{role:"user",content:"Reply with exactly: Marcus connected."}]);toast(a.slice(0,180));status("Model responded")}catch(e){toast(e.message);status("Connection test failed")}};
$("testGroq").onclick=async()=>{try{$("saveGroq").click();const a=await groq([{role:"user",content:"Reply with exactly: Groq helper connected."}]);toast(a.slice(0,180))}catch(e){toast(e.message)}};
$("sendChat").onclick=async()=>{const p=$("chatPrompt").value.trim();if(!p)return;try{$("sendChat").disabled=true;$("chatResult").textContent="Marcus is thinking…";const a=await askMarcus(contextMessages(p));$("chatResult").textContent=a;status("Marcus replied")}catch(e){$("chatResult").textContent=e.message}finally{$("sendChat").disabled=false}};
$("addMemory").onclick=()=>{const title=$("memoryTitle").value.trim(),content=$("memoryContent").value.trim();if(!content)return toast("Write the memory first.");data.memories.push({title:title||"Teaching memory",content,created:new Date().toISOString()});$("memoryTitle").value="";$("memoryContent").value="";save();render();toast("Memory taught to Marcus.")};
$("clearMemories").onclick=()=>{if(confirm("Delete all teaching memories?")){data.memories=[];save();render()}};
$("addExample").onclick=()=>{const prompt=$("examplePrompt").value.trim(),answer=$("exampleAnswer").value.trim();if(!prompt||!answer)return toast("Enter both a prompt and an ideal answer.");data.examples.push({prompt,answer,category:$("exampleCategory").value.trim(),created:new Date().toISOString()});$("examplePrompt").value="";$("exampleAnswer").value="";$("exampleCategory").value="";save();render();toast("Training example added.")};
$("clearExamples").onclick=()=>{if(confirm("Delete all training examples?")){data.examples=[];save();render()}};
$("draftExamples").onclick=async()=>{const topic=$("examplePrompt").value.trim()||prompt("What topic should the examples cover?");if(!topic)return;try{$("draftExamples").disabled=true;const result=await groq([{role:"system",content:"Create exactly 3 high-quality fine-tuning examples. Return only valid JSON array with objects {prompt,answer,category}. Answers must be useful, accurate, distinct, and not mention this instruction."},{role:"user",content:"Topic/context: "+topic+"\nExisting teaching memories: "+data.memories.map(m=>m.title+": "+m.content).join("\n")}]);const clean=result.replace(/^```(?:json)?/i,"").replace(/```$/,"").trim();drafts=JSON.parse(clean);if(!Array.isArray(drafts))throw Error("Expected JSON array");$("draftList").innerHTML=drafts.map((d,i)=>'<label><input type="checkbox" class="draft-check" data-i="'+i+'" checked> <b>'+esc(d.category||"example")+'</b><p>'+esc(d.prompt)+'</p><p>'+esc(d.answer)+'</p></label>').join("");$("draftBox").classList.remove("hidden");toast("Review the drafts, then add the examples you want.")}catch(e){toast("Could not draft examples: "+e.message)}finally{$("draftExamples").disabled=false}};
$("addDrafts").onclick=()=>{document.querySelectorAll(".draft-check:checked").forEach(c=>{const d=drafts[Number(c.dataset.i)];if(d?.prompt&&d?.answer)data.examples.push({...d,created:new Date().toISOString()})});save();render();$("draftBox").classList.add("hidden");toast("Selected examples added.")};

let grindRunning=false,grindStopRequested=false;
function normalizeText(s){return String(s||"").toLowerCase().replace(/\s+/g," ").trim()}
function parseGeneratedExamples(raw){
  let s=String(raw||"").trim().replace(/^\x60\x60\x60(?:json)?\s*/i,"").replace(/\s*\x60\x60\x60$/,"");
  try { const v=JSON.parse(s); if(Array.isArray(v))return v; if(Array.isArray(v.examples))return v.examples; } catch {}
  const start=s.indexOf("["),end=s.lastIndexOf("]");
  if(start>=0&&end>start){const v=JSON.parse(s.slice(start,end+1));if(Array.isArray(v))return v;}
  throw Error("Groq did not return a valid JSON array. Try again or reduce the batch size.");
}
$("startGrind").onclick=async()=>{
  if(grindRunning)return;
  const topic=$("grindTopic").value.trim();
  const target=Math.max(1,Math.min(500,Number($("grindTarget").value)||50));
  const batchSize=Math.max(1,Math.min(10,Number($("grindBatch").value)||5));
  if(!groqKey){toast("Add your Groq API key in Model connection first.");go("connect");return;}
  if(!topic){toast("Enter a training topic first.");$("grindTopic").focus();return;}
  if(data.examples.length>=target){$("grindStatus").textContent="Target already reached: "+data.examples.length+" examples are saved.";return;}
  grindRunning=true;grindStopRequested=false;$("startGrind").disabled=true;$("stopGrind").disabled=false;
  let addedThisRun=0,failedBatches=0;
  try{
    while(!grindStopRequested&&data.examples.length<target){
      const wanted=Math.min(batchSize,target-data.examples.length);
      $("grindStatus").textContent="Groq is generating up to "+wanted+" examples… Saved: "+data.examples.length+"/"+target+".";
      const known=data.examples.slice(-120).map(x=>String(x.prompt||"")).join("\n");
      const memories=data.memories.slice(-60).map(m=>m.title+": "+m.content).join("\n");
      const raw=await groq([
        {role:"system",content:"You are a careful training-data curator. Return ONLY a valid JSON array, no markdown. Each item must have string fields prompt, answer, category. Generate exactly "+wanted+" distinct, high-quality supervised fine-tuning examples. Make questions and answers concrete, useful, accurate, self-contained, varied in difficulty, and non-repetitive. Do not invent facts. If the topic asks for cybersecurity, keep examples defensive, authorized, and educational. Avoid duplicates of existing prompts. Do not include explanations outside the JSON."},
        {role:"user",content:"Topic and goals: "+topic+"\nMarcus system style: "+data.systemPrompt+"\nTeaching memories to reflect when relevant:\n"+(memories||"(none)")+"\nExisting prompt examples to avoid repeating:\n"+(known||"(none)")+"\nReturn exactly "+wanted+" new examples."}
      ]);
      const generated=parseGeneratedExamples(raw);
      let added=0;
      for(const item of generated){
        if(grindStopRequested||data.examples.length>=target)break;
        const promptText=String(item?.prompt||"").trim(),answerText=String(item?.answer||"").trim();
        if(!promptText||!answerText)continue;
        const key=normalizeText(promptText);
        if(data.examples.some(x=>normalizeText(x.prompt)===key))continue;
        data.examples.push({prompt:promptText,answer:answerText,category:String(item.category||topic).trim(),created:new Date().toISOString(),source:"groq-auto"});
        added++;addedThisRun++;
      }
      save();render();
      if(added===0){failedBatches++;if(failedBatches>=3)throw Error("Three batches produced no new unique examples. Change the topic or reduce the batch size.");}
      else failedBatches=0;
      $("grindStatus").textContent="Saved "+data.examples.length+"/"+target+" examples ("+addedThisRun+" added this run). "+(grindStopRequested?"Stopping…":"Continuing automatically…");
      if(!grindStopRequested&&data.examples.length<target)await new Promise(resolve=>setTimeout(resolve,900));
    }
    $("grindStatus").textContent=grindStopRequested?"Paused. Saved "+data.examples.length+" total examples; "+addedThisRun+" added this run.":"Finished! Saved "+data.examples.length+" total examples; "+addedThisRun+" added this run.";
    toast(grindStopRequested?"Training-data grind paused.":"Training-data grind finished.");
  }catch(e){
    $("grindStatus").textContent="Stopped after saving "+addedThisRun+" examples this run. Error: "+e.message;
    toast("Grind stopped: "+e.message);
  }finally{
    grindRunning=false;$("startGrind").disabled=false;$("stopGrind").disabled=true;save();render();
  }
};
$("stopGrind").onclick=()=>{grindStopRequested=true;$("stopGrind").disabled=true;$("grindStatus").textContent="Stopping after the current Groq request…";};
$("useExample").onclick=()=>{if(!data.examples.length)return toast("Add a training example first.");const x=data.examples[Math.floor(Math.random()*data.examples.length)];$("evalPrompt").value=x.prompt;$("evalExpected").value=x.answer};
$("getMarcusAnswer").onclick=async()=>{try{$("evalActual").value=await askMarcus(contextMessages($("evalPrompt").value))}catch(e){toast(e.message)}};
$("gradeAnswer").onclick=async()=>{const q=$("evalPrompt").value.trim(),actual=$("evalActual").value.trim(),expected=$("evalExpected").value.trim();if(!q||!actual||!expected)return toast("Fill in the question, Marcus answer, and ideal answer.");try{$("evalResult").textContent="Evaluating…";$("gradeAnswer").disabled=true;$("evalResult").textContent=await groq([{role:"system",content:"Evaluate the model answer against the ideal answer. Give a score from 0 to 100, list what is correct, what is missing or wrong, and a concrete improvement suggestion. Be fair; wording need not match exactly."},{role:"user",content:"Question: "+q+"\nIdeal answer: "+expected+"\nModel answer: "+actual}])}catch(e){$("evalResult").textContent=e.message}finally{$("gradeAnswer").disabled=false}};
$("saveEvaluation").onclick=()=>{const q=$("evalPrompt").value.trim(),actual=$("evalActual").value.trim(),expected=$("evalExpected").value.trim(),feedback=$("evalResult").textContent;if(!q||!actual)return toast("Run or enter an answer first.");data.evaluations.push({question:q,actual,expected,content:feedback,created:new Date().toISOString()});save();render();toast("Evaluation record saved.")};
$("clearEvaluations").onclick=()=>{if(confirm("Delete evaluation history?")){data.evaluations=[];save();render()}};
function dataset(){return data.examples.map(x=>JSON.stringify({messages:[{role:"system",content:data.systemPrompt},{role:"user",content:x.prompt},{role:"assistant",content:x.answer}]})).join("\n")+(data.examples.length?"\n":"")}
function download(name,content,type="application/json"){const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1500)}
function snapshot(){return {format:"marcus-studio-backup-v1",exportedAt:new Date().toISOString(),data}}
$("downloadJsonl").onclick=$("exportDataset").onclick=()=>download("marcus-finetuning.jsonl",dataset(),"application/jsonl");
$("downloadCsv").onclick=()=>{const q=v=>'"'+String(v||"").replace(/"/g,'""')+'"';download("marcus-training.csv","prompt,ideal_answer,category\n"+data.examples.map(x=>[x.prompt,x.answer,x.category].map(q).join(",")).join("\n"),"text/csv")};
$("exportJson").onclick=()=>download("marcus-data.json",JSON.stringify(snapshot(),null,2));
$("downloadZip").onclick=$("exportTop").onclick=async()=>{try{if(!window.JSZip)throw Error("ZIP library did not load. Check your internet connection and refresh.");const z=new JSZip(),folder=z.folder("Marcus");folder.file("index.html",await (await fetch("index.html")).text());folder.file("app.js",await (await fetch("app.js")).text());folder.file("styles.css",await (await fetch("styles.css")).text());folder.file("worker/src/index.js",await (await fetch("worker/src/index.js")).text());folder.file("worker/wrangler.toml",await (await fetch("worker/wrangler.toml")).text());folder.file("worker/README.md",await (await fetch("worker/README.md")).text());folder.file("README.md","# Marcus Studio Backup\n\nRemote Llama workflow: teaching memory, dataset curation, evaluation, and export. The worker/ folder contains the Cloudflare Worker source for hosted inference. Deploy it separately and configure the endpoint in Model connection. Groq API helps draft/evaluate data; it does not fine-tune model weights.\n");folder.file("marcus-data.json",JSON.stringify(snapshot(),null,2));folder.file("marcus-finetuning.jsonl",dataset());folder.file("README-EXPORT.txt","API keys are deliberately excluded. Keep this ZIP private if your memories or examples contain personal data. The JSONL file is a dataset, not a trained model.\n");const blob=await z.generateAsync({type:"blob"});const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="Marcus-"+new Date().toISOString().slice(0,10)+".zip";a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);toast("Marcus ZIP created.")}catch(e){toast("Export failed: "+e.message)}};
$("importZip").onchange=async e=>{const f=e.target.files[0];if(!f)return;try{if(!window.JSZip)throw Error("ZIP library did not load.");const z=await JSZip.loadAsync(f),file=z.file("Marcus/marcus-data.json")||z.file("marcus-data.json");if(!file)throw Error("No Marcus data JSON found in this ZIP.");const imported=JSON.parse(await file.async("text"));if(!imported.data)throw Error("Backup format not recognized.");if(!confirm("Import this backup? It replaces current memories, examples, and evaluations."))return;data={...defaults,...imported.data};save();render();toast("Marcus data restored. API keys were not imported.")}catch(err){toast("Import failed: "+err.message)}finally{e.target.value=""}};
render();
