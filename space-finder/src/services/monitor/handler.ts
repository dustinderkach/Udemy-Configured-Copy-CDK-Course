import { SNSEvent } from "aws-lambda";

const webHookUrl = 'https://hooks.slack.com/services/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';

async function handler(event: SNSEvent, context) {
    for (const record of event.Records) {

        await fetch(webHookUrl, {
            method: 'POST',
            body: JSON.stringify({
                "text": `Huston, we have a problem: ${record.Sns.Message}`
            })
        })
    }
}


export { handler }