// Checks delivery behaviour using a mocked provider. Does not send email.
const fs=require('fs');const vm=require('vm');const assert=require('node:assert/strict');const ts=require('typescript');
const source=ts.transpileModule(fs.readFileSync('app/api/contact/route.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
let sent=[];let providerError=false;
class FakeResend{emails={send:async(message,options)=>{sent.push({message,options});return {error:providerError?{name:'validation_error'}:null};}}}
const testEnv={};const mod={exports:{}};
vm.runInNewContext(source,{require:(id)=>id==='resend'?{Resend:FakeResend}:require(id),exports:mod.exports,module:mod,process:{env:testEnv},Buffer,console:{error:()=>{}},Date,URL});
const id='fe220ebf-362d-4a98-8327-7d96e5976a6d';
const base={email:'visitor@example.com',consent:'yes',submissionId:id};
const enquiry={...base,kind:'enquiry',organisation:'Test School',name:'Test Visitor',phone:'+2348012345678',purpose:'School training sessions',topic:'Digital skills',participants:'12',startDate:'2026-11-10',endDate:'2026-11-11',support:'Single session',computers:'0',notes:'<test> & text'};
async function post(payload,origin='http://localhost:3000'){return mod.exports.POST(new Request('http://localhost:3000/api/contact',{method:'POST',headers:{'Content-Type':'application/json',origin},body:JSON.stringify(payload)}));}
(async()=>{
assert.equal((await post({...base,kind:'newsletter',email:'bad'})).status,400);
assert.equal((await post({...base,kind:'newsletter',consent:''})).status,400);
assert.equal((await post({...enquiry,endDate:'2026-11-09'})).status,400);
assert.equal((await post({...base,kind:'newsletter'},'https://foreign.example')).status,403);
assert.equal((await post(enquiry)).status,503);
Object.assign(testEnv,{RESEND_API_KEY:'test-only',RESEND_FROM_EMAIL:'MPIITECH <hello@example.com>',CONTACT_TO_EMAIL:'admin@example.com,second@example.com'});
for(const payload of [enquiry,{...base,kind:'programme',programme:'Digital Foundations'},{...base,kind:'newsletter'}])assert.equal((await post(payload)).status,200);
assert.equal(sent.length,3);assert.deepEqual(JSON.parse(JSON.stringify(sent[0].message.to)),['admin@example.com','second@example.com']);assert.equal(sent[0].message.replyTo,'visitor@example.com');assert.ok(sent[0].message.text.includes('Computers required: 0'));assert.ok(sent[0].message.text.includes('Additional notes: <test> & text'));assert.equal(sent[0].options.idempotencyKey,`mpiitech-${id}`);
assert.equal((await post({...base,kind:'newsletter',website:'spam'})).status,200);assert.equal(sent.length,3);
providerError=true;assert.equal((await post({...base,kind:'newsletter'})).status,502);
console.log('PASS: email, consent, dates, origin, missing config, three form types, fixed recipients, reply-to, zero computers, plain-text payload, idempotency, honeypot, and provider failure. No emails sent.');
})().catch(error=>{console.error(error);process.exitCode=1;});
