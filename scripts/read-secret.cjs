const fs = require('node:fs');
module.exports = async function readSecret(fromStdin = false) {
  if(fromStdin) return fs.readFileSync(0,'utf8').replace(/\r?\n$/, '');
  if(!process.stdin.isTTY) throw new Error('Use una terminal interactiva o --password-stdin con entrada segura. No se admite la contrasena como argumento.');
  process.stdout.write('Contrasena (entrada oculta): ');
  const input=process.stdin;
  input.setRawMode(true); input.resume(); input.setEncoding('utf8');
  return new Promise((resolve,reject)=>{
    let value='';
    const finish=(error)=>{
      input.off('data',onData);input.setRawMode(false);input.pause();process.stdout.write('\n');
      if(error)reject(error);else resolve(value);
    };
    const onData=chunk=>{
      for(const c of chunk){
        if(c==='\u0003')return finish(new Error('Cancelado'));
        if(c==='\r'||c==='\n')return finish();
        if(c==='\u007f'||c==='\b')value=[...value].slice(0,-1).join('');
        else if(c>=' ')value+=c;
      }
    };
    input.on('data',onData);
  });
};
