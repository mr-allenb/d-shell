<template>
  <div id="terminal" ref="terminal">
  </div>
</template>
<script>
import { Terminal } from "xterm"
import { FitAddon } from 'xterm-addon-fit'
import "xterm/css/xterm.css"
export default {
  props:['uuid'],
data() {
  return {
    tableHeight:0,
    term: "", // 保存terminal实例
    electron:null,
    cols: 100,
    stompClient: '',
    data:'',
    path:'',
    rows:0,
    allowAppend:true
  }
},

beforeDestroy(){
  this.electron.ipcRenderer.removeAllListeners()
},
mounted(){
  this.calcTableHeight();
  this.electron=window.require('electron')
  this.electron.ipcRenderer.on('sendCom', this.onData)
  this.initSocket()
},
methods: {
  calcTableHeight(){
    const clientHeight = document.documentElement.clientHeight
    this.rows=parseInt((clientHeight - 380) /18)
    console.log(parseInt(this.rows))
  },
  onData(event, res) {
    console.log(res)
    console.log(this.uuid)
    if(res.uuid!=this.uuid){
      return
    }
    if(res.code=='command'){
        for(var i=0;i<res.data.length;i++){
          var text=res.data[i]
          // if(i==res.data.length-1){
          //   const lastNewLineIndex = text.lastIndexOf("\n");
          //   text=text.slice(0, lastNewLineIndex) + text.slice(lastNewLineIndex + 1);
          // }
          if(text.length>0){
            this.writeShell(text)
          }
        }
        this.data=''
        this.term.prompt();
      }else if(res.code=='pwd'){
        this.path=res.data[0]+""
        this.data=''
        this.term.prompt();
        this.$emit('connected', '10.160.8.42', this.uuid,this.path);
      }else{
        this.path=res.data[0]+""
        this.data=''
        this.term.prompt();
        this.$emit('connected', '10.160.8.42', this.uuid,this.path);
      }
  },
  initXterm() {
    let _this = this
    var colWidth = document.getElementById("terminal").clientWidth;
    let term = new Terminal({
      rows:_this.rows,
      cols:parseInt(colWidth/9)-2,
      convertEol: true, //启用时，光标将设置为下一行的开头
      // scrollback: 50, //终端中的回滚量
      disableStdin: false, //是否应禁用输入
      // cursorStyle: "underline", //光标样式
      cursorBlink: true, //光标闪烁
      theme: {
        foreground: "#ECECEC", //字体
        background: "#000000", //背景色
        cursor: "help", //设置光标
        lineHeight: 20
      }
    })
    term.open(this.$refs["terminal"])
    // 换行并输入起始符 $
    term.prompt = _ => {
      //term.write("\r\n\x1b[33m$\x1b[0m ")
      term.write('\x1b[33m'+_this.path.replace('\n','')+'$\x1b[0m ')
    }
    // term.prompt()
    // canvas背景全屏
    const fitAddon = new FitAddon()
    term.loadAddon(fitAddon)
    fitAddon.fit()

    window.addEventListener("resize", resizeScreen)
    function resizeScreen() {
      _this.calcTableHeight()
      var colWidth = document.getElementById("terminal").clientWidth;
      _this.term.resize(parseInt(colWidth/9)-2, _this.rows)
      
      
    }
    _this.term = term
    _this.runFakeTerminal()
  },
  runFakeTerminal() {
    let term = this.term
    if (term._initialized) return
    // 初始化
    term._initialized = true
    term.writeln("Welcome to dean's term")
    term.onData((key,e) => {  // 输入与粘贴的情况
      if(key&&this.allowAppend){
        this.data=this.data+key
        term.write(key);
      }
      this.allowAppend=true
    })
    term.onKey((e) => {
      const ev = e.domEvent
          const printable = !ev.altKey && !ev.altGraphKey && !ev.ctrlKey && !ev.metaKey
          if (ev.keyCode === 13) {
              term.write('\n')
              if(this.data=='clear'){
                this.allowAppend=false
                term.clear()
                term.writeln("Welcome to dean's term")
                term.prompt()
                this.data=''
                
              }else{
                this.sendShell(this.data)
              }
          } else if (ev.keyCode === 8) {
            this.allowAppend=false
              if (term._core.buffer.x > this.path.length+1) {
                  this.data=this.data.substring(0,this.data.length-1)
                  term.write('\b \b')
              }
          } else if (printable) {
            this.allowAppend=true
          }
    });
  },
  initSocket() {
    this.initXterm()
    this.sentFirst()
  },
  sendShell (data) {
    let _bar = {
      operate:'command',
      command: data,
      uuid: this.uuid,
      host: '10.160.8.42',
      path: this.path.replace('\n','').replace(' ','')
    }
    this.electron.ipcRenderer.send('sendCom',_bar);
  },
  writeShell(data) {
    this.term.write(data)
  },
  // 连接建立，首次发送消息连接 ssh
  sentFirst () {
    let _bar = {
      operate:'connect',
      host: '10.160.8.42',
      port: 22,
      username: 'admin01',
      password: 'Vy5252##',
      uuid: this.uuid
    }
    this.electron.ipcRenderer.send('sendCom',_bar);
   
  }
}
}
</script>
<style>
.terminal{
padding: 15px; 
}
</style>