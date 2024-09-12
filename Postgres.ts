import {ChildProcess} from "node:child_process";
import {spawn} from "child_process";

type Config = {
  password: string,
  database: string,
  port?: number,
  host?: string,
  user?: string
}

type RawData = {
  [key: string]: any
}

type Query = {
  id: number,
  onReady?: () => void,
  onError?: () => void,
}

export default class Postgres {
  private _process: ChildProcess;

  private _workingQueries: Query[] = [];
  private _promises: Promise<RawData[]>[] = [];

  constructor(config: Config) {
    const password = config.password;
    const database = config.database;

    const user = config.user ? config.user : 'postgres';
    const host = config.host ? config.host : 'localhost';
    const port = config.port ? config.port : '5432';

    this._process = spawn(`${process.env.PSQL_PATH} postgresql://${user}:${password}@${host}:${port}/${database}`, [], { shell: true });
  }

  public query(query: string): Promise<RawData[]> {
    return new Promise(async (resolve, reject) => {
      if(this._workingQueries.length >= 1) {
        const queryObj = this._workingQueries[this._workingQueries.length - 1]
        queryObj.onReady = () => { this._query(query).then((data) => resolve(data)).catch(err => reject(err)); };
      } else this._query(query).then((data) => resolve(data)).catch(err => reject(err));
    })
  }

  private parseData(data: Buffer) {
    const rows = [];
    const result = data.toString().split('\n');
    let tableColumns = result[0].split('|');
    tableColumns = tableColumns.map((column: string) => column.trim());

    for(let i = 2; i < result.length; i++) {
      let columns = result[i].split('|');
      if(result[i].startsWith('(')) break;

      let obj: { [key: string]: string } = {};
      let flag = false;
      columns.forEach((column: string, index: number) => {
        obj[tableColumns[index]] = column.trim();
        if(obj[tableColumns[index]].endsWith('+')) flag = true;
      })

      if(flag) {
        flag = false;
        i++;
        columns = result[i].split('|');
        columns.forEach((column: string, index: number) => {
          let str = obj[tableColumns[index]];
          if(str.endsWith('+')) str = str.substring(0, str.length - 1);
          str += column.trim();

          obj[tableColumns[index]] = str.trim();
        })
      }

      rows.push(obj);
    }

    return rows;
  }

  private _query(query: string): Promise<RawData[]> {
    return new Promise((resolve, reject) => {
      const queryId = this._workingQueries.length === 0 ? 1 : this._workingQueries[this._workingQueries.length - 1].id + 1;
      const queryObj: Query = {
        id: queryId
      }
      this._workingQueries.push(queryObj);

      this._process.stdin.write(`${query};\n`);

      const procOnData = onData.bind({process: this, id: queryId});

      this._process.stdout.on('data', procOnData);

      this._process.stdout.on('error', (data) => {
        reject(new Error(`Error: ${data.toString()}`));
      })

      const procOnError = onError.bind({process: this, id: queryId});
      this._process.stderr.on('data', procOnError);

      const cleanup = (id: number) => {
        this._process.stdout.off('data', procOnData);
        this._process.stderr.off('data', procOnError);

        this._workingQueries.forEach((elem, index) => {
          if(elem.id === id) this._workingQueries.splice(index, 1);
        })
      }

      function onData(this: { process: Postgres, id: number }, data: Buffer) {
        const rows = this.process.parseData(data);
        cleanup(this.id);
        if(queryObj.onReady) queryObj.onReady();
        resolve(rows);
      }

      function onError(this: { process: Postgres, id: number }, data: Buffer) {
        if(queryId !== this.id) return;
        const err = new Error('Database Error: ' + data.toString());
        cleanup(this.id);
        reject(err);
      }

    })
  }
}