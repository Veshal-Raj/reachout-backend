import Agenda from "agenda";
import dotenv from 'dotenv';
dotenv.config();

const agenda = new Agenda({
  db: {
    address: process.env.DB_URL,
    collection: "agendaJobs"
  }
});

export default agenda;