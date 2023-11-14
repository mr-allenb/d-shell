const Client=require('ssh2').Client

var map={
}

const queryFiles = (data) => {
    return new Promise((resolve, reject) => {
        conn = map[data.host];
        var cmd=data.command
        var output=[]
        conn.exec(cmd, (err, stream) => {
            if (err) reject(err);
            stream.on('close', (code, signal) => {
                resolve({data:output,code:'command',folder:data.folder,uuid:data.uuid});
            }).on('data', (data) => {
                output.push(''+data);
            }).stderr.on('data', (data) => {
                output.push(''+data);
            });
        });
    });
}

const sendCom = (data) => {
    return new Promise((resolve, reject) => {
        var conn = null;
        var output = [];
        if (data.operate == 'connect') {
            conn = new Client();
            conn.connect({
                host: data.host,
                port: data.port,
                username: data.username,
                password: data.password,
            });
            conn.on('ready', () => {
                map[data.host] = conn;
                conn.exec('pwd', (err, stream) => {
                    if (err) reject(err);
                    stream.on('close', (code, signal) => {
                        console.log('first')
                        resolve({data:output,code:'pwd-first',uuid:data.uuid});
                    }).on('data', (data) => {
                        output.push(''+data);
                    }).stderr.on('data', (data) => {
                        output.push('' + data);
                    });
                });
            });
        } else {
            conn = map[data.host];
                var cmd='cd '+data.path+' && '+data.command
                if(data.command.startsWith('cd ')){
                    cmd=cmd+' && pwd'
                }
                conn.exec(cmd, (err, stream) => {
                    if (err) reject(err);
                    stream.on('close', (code, signal) => {
                        if(data.command.startsWith('cd ')){
                            if(output[0].indexOf('No such file or directory')==-1){
                                resolve({data:output,code:'pwd',uuid:data.uuid});
                            }else{
                                resolve({data:output,code:'command',uuid:data.uuid});
                            }
                        }else{
                            resolve({data:output,code:'command',uuid:data.uuid});
                        }
                        
                    }).on('data', (data) => {
                        output.push(''+data);
                    }).stderr.on('data', (data) => {
                        output.push('' + data);
                    });
                });
        }
    });
};

module.exports = {
    sendCom,
    queryFiles
};