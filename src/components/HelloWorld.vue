<template>
  <div class="content">

    <el-dialog
      title="Add Host"
      :visible.sync="dialogVisible"
      width="30%">
      <el-form ref="form" size="mini" :model="form" label-width="120px">
        <el-form-item label="Label">
          <el-select v-model="form.label" placeholder="" filterable
              allow-create
              default-first-option>
            <el-option v-for="(item,i) in data" :label="item.label" :value="label"></el-option>
          </el-select>
        </el-form-item>
        <el-divider content-position="left">General</el-divider>
        <el-form-item label="Name">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item label="Host">
          <el-input v-model="form.host"></el-input>
        </el-form-item>
        <el-form-item label="Port">
          <el-input v-model="form.port"></el-input>
        </el-form-item>
        <el-divider content-position="left">Authorization</el-divider>
        <el-form-item label="Method">
          <el-select v-model="form.region" placeholder="">
            <el-option label="Password" value="password"></el-option>
            <el-option label="Key" value="key"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="User Name">
          <el-input v-model="form.username"></el-input>
        </el-form-item>
        <el-form-item label="Password">
          <el-input v-model="form.password"></el-input>
        </el-form-item>
        <el-form-item label="Key">
          
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="dialogVisible = false">Cancel</el-button>
        <el-button size="mini" type="primary" @click="submitAddHost()">Submit</el-button>
      </span>
    </el-dialog>

    <div class="left">
      <el-tree class="hosts"
      :data="data"
      node-key="id"
      default-expand-all
      :expand-on-click-node="false">
      <span class="custom-tree-node" slot-scope="{ node, data }" style="display: inline-block;width: 100%;">
        <span v-on:dblclick="connectHost(node)" style="display: inline-block;width: 100%;">{{ node.label }}</span>
      </span>
    </el-tree>
    <div style="padding: 0px 20px;">
    <el-button size="mini" @click="addHost" type="primary" style="display: inline-block;width: 100%;">
      Add
    </el-button>
    </div>
    </div>
    <div class="right">
      <el-tabs type="border-card" closable v-model="activeName" >
        <el-tab-pane  name="Home" label="Home">
          <div :style="{height:(tableHeight - 41)+'px'}">
            <div style="width: 400px;padding: 100px 0px;margin: 0 auto;">
              History
              <p>xxx</p>
              <p>xxx</p>
              <p>xxx</p>
              <p>xxx</p>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane v-for="tab in tabs.filter(item=>item.show!=0)" :name="tab.name" :label="tab.name">
          <Cmd @connected="handleConnected" :uuid="tab.uuid"></Cmd>
          <div class="files">
            
            <div style="padding: 8px 10px;border: 1px solid #ddd;border-left: 0px;">
              <el-breadcrumb separator-class="el-icon-arrow-right">
                  <el-breadcrumb-item v-for="(p,i) in tab.path.split('/')">
                    <span @click="toPath(i,tab.path)" style="cursor: pointer;">{{ p==''?'/':p }}</span>
                  </el-breadcrumb-item>
                </el-breadcrumb>
            </div>
            <div class="left" style="height: 100%;" >
              <el-tree style="height: 100%;overflow: auto;"
                :data="tab.folders"
                node-key="id"
                @node-click="handleNodeClick"
                default-expand-all
                :expand-on-click-node="false">
              </el-tree>
            </div>
            <div class="right" style="height: 100%;overflow: auto;">
              
              <div style="padding: 10px;">
                  <el-table
                    :data="tab.tableData"
                    style="width: 100%">
                    <el-table-column
                      prop="fileName"
                      label="File Name">
                      <template v-slot="scope">
                        <i v-if="scope.row.fileName.slice(-1)=='/'" class="el-icon-folder">
                        </i>
                        <i v-else class="el-icon-document">
                        </i>
                        <span @click="clickPath(scope.row)">{{ scope.row.fileName.substring(0,scope.row.fileName.length-1) }}</span>
                      </template>

                    </el-table-column>
                    <el-table-column
                      prop="size"
                      label="Size"
                      width="180">
                    </el-table-column>
                    <el-table-column
                      prop="date"
                      width="180"
                      label="Date">
                    </el-table-column>
                    <el-table-column
                      prop="permissions"
                      width="180"
                      label="Permissions">
                    </el-table-column>
                    <el-table-column
                      prop="user"
                      width="180"
                      label="User/User Group">
                      <template v-slot="scope">
                        {{ scope.row.user }}/{{ scope.row.userGroup }}
                      </template>
                    </el-table-column>
                  </el-table>
              </div>
            </div>
          </div>
        </el-tab-pane>
        
      </el-tabs>
      
    </div>
  </div>
</template>
<script>
import Cmd from './Cmd.vue'
export default {
  components:{
    Cmd
  },
data() {
  return {
    activeName:'Home',
    form:{},
    dialogVisible:false,
    tableHeight:0,
    electron:null,
    folders:[{ label: "/", path: "/", children: [] }],
    tabs:[],
    data: [{ "label": "local",
     "children": [ { "label": "test", "name": "test", "host": "10.160.8.42", "port": "22", "region": "password", "username": "admin01", "password": "Vy5252##" }, 
     { "label": "test1", "name": "test1", "host": "10.160.8.42", "port": "22", "region": "password", "username": "admin01", "password": "Vy5252##" } ] }, 
     { "label": "dev", "children": [ { "label": "test2", "name": "test2", "host": "10.160.8.42", "port": "22", "region": "password", "username": "admin01", "password": "Vy5252##" } ] } ]
  }
},
mounted() {
  this.folders=[{ label: "/", path: "/", children: [] }]
  this.electron=window.require('electron')
  this.electron.ipcRenderer.on('queryFiles', this.onData)
},
beforeDestroy(){
  
},
created(){
  this.calcTableHeight()
},
methods: {
  guid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
  },
  connectHost(node){
    this.activeName=node.data.name
    node.data.uuid=this.guid()
    node.data.folders=[{ label: "/", path: "/", children: [] }]
    node.data.path=''
    node.data.tableData=[]
    this.tabs.push(node.data)
  },
  submitAddHost(){
    var data=JSON.parse(JSON.stringify(this.form))
    var label=data.label
    data.label=data.name
    var obj=this.data.find(item=>item.label==label)
    if(!obj){
      console.log(data)
      this.data.push(
        { label: label, children: [data] }
      )
    }else{
      obj.children.push(data)
    }
    this.dialogVisible=false
  },
  addHost(){
    this.dialogVisible=true
  },
  toPath(index,path){
    var arr=path.split('/')
    var finalPath=''
    for(var i=0;i<=index;i++){
      if(arr[i]==''){
        continue
      }
      finalPath=finalPath+'/'+arr[i]
    }
    if(finalPath==''){
      finalPath='/'
    }
    this.handleConnected('10.160.8.42','',finalPath)
  },
  clickPath(item){
    console.log(item.path)
    if(item.fileName.slice(-1)=='/'){
      this.handleConnected('10.160.8.42','',item.path.substring(0,item.path.length-1))  
    }
  },
  handleNodeClick(data){
    this.handleConnected('10.160.8.42','',data.path)
  },
  onData(event, res) {
    var obj=this.tabs.find(item=>item.uuid==res.uuid)
    console.log(obj)
    if(obj==null){
      return
    }
    var path=res.folder.replace('\n','')
    var result=[]
    for(var i=0;i<res.data.length;i++){
      var arr=res.data[i].split('\n')
      for(var j=0;j<arr.length;j++){
        if(arr[j].split(' ').length==2){
          continue
        }
        var fileInfos=arr[j].split(' ').filter(item=>item!='')
        if(fileInfos.length>0){
          var fileName=fileInfos[fileInfos.length-1]
          var pathStr=''
          if(path=='/'){
            pathStr=path+fileName
          }else{
            pathStr=path+'/'+fileName
          }
          result.push({
            fileName:fileName,
            permissions:fileInfos[0],
            path:pathStr,
            user:fileInfos[2],
            userGroup:fileInfos[3],
            size:fileInfos[4],
            date:fileInfos[5]+' '+fileInfos[6],
          })
        }
      }
    }
    for(var i=0;i<result.length;i++){
      if(result[i].fileName.trim()==''){
        continue
      }
      var last = result[i].fileName.slice(-1);
      var str=result[i].fileName.substring(0,result[i].fileName.length-1)
      if(last=='/'){
        this.addToTree(obj.folders, path, str); 
      }
      this.tabs.push({show:0})
    }
    obj.tableData=result
  },
  listAllLevels(path) {
    const levels = path.split('/');
    const result = ['/'];
    let currentPath = '';
    levels.forEach(level => {
        if (level) {
            currentPath += '/' + level;
            result.push(currentPath);
        }
    });
    return result;
  },
  handleConnected(host,uuid,path){
    this.uuid=uuid
    var obj=this.tabs.find(item=>item.uuid==uuid)
    obj.path=path.replace('\n','').trim()
    this.$set(obj,'path',path.replace('\n','').trim())
    var paths=this.listAllLevels(path)
    for(var i=0;i<paths.length;i++){
      let _bar = {
        operate:'command',
        folder:paths[i],
        command: 'ls -lFA --time-style=+"%Y-%m-%d %H:%M:%S" '+paths[i],
        uuid: uuid,
        host: host,
      }
      this.electron.ipcRenderer.send('queryFiles',_bar);
    }
  },
  addToTree(tree, path, value) {
    const parts = path.split('/').filter(part => part !== ''); // 过滤掉空字符串
    function findOrAddNode(current, label, path) {
        let foundNode = current.find(node => node.label === label);
        if (!foundNode) {
            foundNode = { label, path, children: [] };
            current.push(foundNode);
        }
        return foundNode;
    }
    function addValueRecursive(currentNode, remainingParts) {
        if (remainingParts.length === 0) {
            if (!currentNode.children.find(node => node.label === value)) {
              if(path=="/"){
                currentNode.children.push({ label: value, path: path + value, children: [] });
              }else{
                currentNode.children.push({ label: value, path: path +"/"+ value, children: [] });
              }
            }
            return;
        }
        const part = remainingParts.shift();
        const nextNode = findOrAddNode(currentNode.children, part, currentNode.path + '/' + part);
        addValueRecursive(nextNode, remainingParts);
    }
    addValueRecursive(tree[0], parts);
},
  calcTableHeight(){
    const clientHeight = document.documentElement.clientHeight
    this.tableHeight = clientHeight
  }
}
}
</script>
<style>
.el-dialog__header,.el-dialog__footer{
  padding: 10px 20px!important;
}
.el-dialog__header{
  border-bottom: 1px solid #ddd;
}
.el-dialog{
  border: 6px solid rgba(0,0,0,.7);
  border-radius: 5px;
    box-shadow: none;
}
.el-dialog__body{
  padding: 20px 20px!important;
}
.el-table .el-table__cell{
  padding: 5px 0px !important;
}
.files{
  height: 290px;
}
.el-tree-node__content{
  width: 100%!important;
  display: inline-block!important;
}
.custom-tree-node{
  width: calc(100% - 42px)!important;
  display: inline-block!important;
}
.hosts{
  padding: 20px;
}
.el-tabs__header{
  margin: 0px!important;
}
.content{
  width: 100%;
}
.terminal{
padding: 15px; 
}
.left,.right{
  float: left;
}
.left{
  width: 300px;
}
.right{
  width: calc(100% - 300px);
}
.el-divider--horizontal{
  margin: 10px 0px!important;
}
.el-tabs--border-card>.el-tabs__content{
  padding: 0px!important;
}
.el-tabs--border-card{
  box-shadow: none!important;
}
</style>