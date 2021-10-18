import { Context, HttpRequest } from "@azure/functions"
import * as Twilio from "twilio";
import { OpenRoute } from '@flyweight.cloud/openroute'
import { HttpError } from '@flyweight.cloud/openroute/lib/errors'

import openApi2 from './openapi2'

const from = process.env['TWILIO_FROM']
const accountSid = process.env['TWILIO_SID']
const authToken = process.env['TWILIO_AUTH']

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
}

const app = new OpenRoute({
    openApiDef: {
        "2": openApi2,
    },
});

app.route({ post: "/" }, async (context: Context, req: HttpRequest): Promise<void> => {

    context.log('HTTP trigger function processed a request.');
    const content = ((req.body && req.body.content));
    const to = ((req.body && req.body.to));
    const client = Twilio(accountSid, authToken);

    if (!content && !to) {
      throw new HttpError("Require fields missing", 400)
    }

    let call = await client.calls
        .create({
            twiml: `<Response><Say>${escapeXml(content)}</Say></Response>`,
            to,
            from,
        })

    console.log(call)

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: {
          status: 'ok'
        }
    };


});

export default app.getHttpTrigger()
