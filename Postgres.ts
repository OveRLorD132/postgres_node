import {ChildProcess} from "node:child_process";
import {spawn} from "child_process";

type Config = {
  port?: number,
  host?: string,
  user?: string
}

export default class Postgres {
  private _process: ChildProcess;

  constructor(password: string, database: string, config?: Config) {
    const user = config.user ? config.user : 'postgres';
    const host = config.host ? config.host : 'localhost';
    const port = config.port ? config.port : '5432';

    this._process = spawn(`D:\\psql\\bin\\psql.exe postgresql://postgres:${password}@localhost:5432/conferences`, [], { shell: true });
  }
}