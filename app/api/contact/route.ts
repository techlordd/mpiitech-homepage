import {NextResponse} from 'next/server';
import {Resend} from 'resend';
import {z} from 'zod';
export const runtime = 'nodejs';
const short=z.string().trim().max(200);
const optional=short.optional().default('');
const base={email:z.email().max(254),consent:z.literal('yes'),website:z.string().max(200).optional().default(''),submissionId:z.uuid()};
const programmeNames=['Digital Foundations','Full-Stack Web Development','Network Administration & Security','Data Analytics with Python','AI Engineering'] as const;
const date=z.iso.date();
const schema=z.discriminatedUnion('kind',[
  z.object({...base,kind:z.literal('newsletter')}),
  z.object({...base,kind:z.literal('programme'),programme:z.enum(programmeNames)}),
  z.object({...base,kind:z.literal('enquiry'),organisation:short.min(1),name:short.min(1),phone:short.min(5),purpose:z.enum(['Corporate training','School training sessions','Computer-based testing','Certification programmes','Employee upskilling','Other']),topic:short.min(1),participants:z.coerce.number().int().min(1).max(10000),times:optional,startDate:date,endDate:date,flexibleDates:z.enum(['yes','']).optional().default(''),support:z.enum(['Single session','Multiple sessions','Weekly programme','Other']),computers:z.union([z.literal(''),z.coerce.number().int().min(0).max(10000)]).optional().default(''),equipment:z.string().trim().max(2000).optional().default(''),budget:optional,notes:z.string().trim().max(3000).optional().default('')}).refine(x=>x.endDate>=x.startDate,{message:'End date must be on or after start date.',path:['endDate']})
]);
const labels:Record<string,string>={organisation:'Organisation / school',name:'Contact person',email:'Email address',phone:'Phone / WhatsApp',purpose:'Training / assessment type',topic:'Topic / assessment',participants:'Participants',times:'Preferred times',startDate:'Start date',endDate:'End date',flexibleDates:'Flexible dates / times',support:'Support arrangement',computers:'Computers required',equipment:'Equipment / access needs',budget:'Budget (NGN)',notes:'Additional notes',programme:'Programme'};
export async function POST(request:Request){
  try {
    // Reject browser submissions from a different origin. Keep API key and recipients server-side.
    const origin=request.headers.get('origin');
    if(origin && origin!==new URL(request.url).origin) return NextResponse.json({error:'Please submit using this website.'},{status:403});
    if(!request.headers.get('content-type')?.includes('application/json')) return NextResponse.json({error:'Invalid request format.'},{status:415});
    const raw=await request.text();
    if(Buffer.byteLength(raw,'utf8')>16000) return NextResponse.json({error:'Your enquiry is too long.'},{status:413});
    let body:unknown;
    try{body=JSON.parse(raw);}catch{return NextResponse.json({error:'Invalid request.'},{status:400});}
    const parsed=schema.safeParse(body);
    if(!parsed.success) return NextResponse.json({error:parsed.error.issues.some(x=>x.path.includes('endDate'))?'Please check your dates: the end date must be on or after the start date.':'Please complete the required fields with valid details and agree to the consent notice.'},{status:400});
    const data=parsed.data;
    if(data.website) return NextResponse.json({success:true}); // Honeypot: no email sent.
    const key=process.env.RESEND_API_KEY, from=process.env.RESEND_FROM_EMAIL;
    const recipients=process.env.CONTACT_TO_EMAIL?.split(',').map(x=>x.trim()).filter(Boolean);
    if(!key||!from||!recipients?.length||recipients.some(x=>!z.email().safeParse(x).success)) return NextResponse.json({error:'Email delivery is not configured yet. Please contact the center directly.'},{status:503});
    const subject=data.kind==='enquiry'?'MPIITECH — New center hire enquiry':data.kind==='programme'?`MPIITECH — Programme notification request: ${data.programme}`:'MPIITECH — Newsletter subscription request';
    const entries=Object.entries(data).filter(([key])=>key in labels);
    const text=[subject,'',...entries.map(([key,value])=>`${labels[key]}: ${value === '' ? 'Not provided' : value}`),'','Consent: provided','Source: MPIITECH homepage',`Submitted: ${new Date().toISOString()}`].join('\n');
    const {error}=await new Resend(key).emails.send({from,to:recipients,replyTo:data.email,subject,text},{idempotencyKey:`mpiitech-${data.submissionId}`});
    if(error){console.error('Resend email delivery failed:',error.name);return NextResponse.json({error:'We could not send your request. Please try again shortly.'},{status:502});}
    return NextResponse.json({success:true});
  } catch {return NextResponse.json({error:'We could not send your request. Please try again shortly.'},{status:500});}
}
