import dotenv from 'dotenv';
dotenv.config();

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

(async function () {
  const { data, error } = await resend.emails.send({
    from: 'veshaldev1307@gmail.com',
    to: ['veshalraj1307@gmail.com'],
    subject: 'Hello World',
    html: '<strong>It works!</strong>',
  });

  if (error) {
    return console.error({ error });
  }

  console.log({ data });
})();