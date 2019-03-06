<template>
    <div class="menu-new">
        <div class="menuItem" @click="newFileClickHandle">笔记</div>
        <div class="menuItem" @click="newFoldClickHandle">文件夹</div>
    </div>
</template>

<script>
    import store from '../store'
    export default {
        data() {
            return {
                
            }
        },
        methods: {
            newFileClickHandle() {

            },
            newFoldClickHandle() {
                debugger
                store.dispatch('invokeSetRenameState', true)
            }
        }
    }
</script>

<style lang="less" scoped>
    .menu-new {
        width: 62px;
        margin-left: 30px;
        // box-shadow: 1px 1px 2px 1px rgba(0,0,0,.16);
        box-shadow: #666 0px 0px 3px;
        border-radius: 4%;
        font-size: 12px;
        text-align: left;
        background: #f7f7f7;
        padding-top: 0px; 
        color: #616161;
        // background: tan
        .menuItem {
            padding-left: 5px;
            width: 100%;
            height: 22px;
            line-height: 22px;
            margin-top: 6px; 
            margin-bottom: 6px; 
            .arrow-right {
                margin-left: 12px;
                margin-top: -2.5px;
            }
        }
        .menuItem:hover {
            background: #398dee;
            color: #fffffe;
        }
    }
</style>