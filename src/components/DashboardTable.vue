<template>
    <div class="dashboard-container">
        <div class="dashboard__controls">
            <Button @click="$emit('add-row')" :label="addRowLabel" />
            <Button @click="updateRowRequest" :label="updateRowLabel" :disabled="updateDisabled" />

        </div>
        <div class="dashboard__table">
            <DataTable class="display responsive nowrap" :options="{ select: true }" :columns="columns" :data="data" ref="table"  style="width:100%">
                
            </DataTable>
        </div>
    </div>

    

</template>

<script setup lang="ts">

import DataTable from 'datatables.net-vue3';
import DataTablesCore from 'datatables.net';
import Responsive from 'datatables.net-responsive';
import Select from 'datatables.net-select';
import Button from 'primevue/button';
import { defineProps, defineEmits,defineExpose, onMounted, ref, watch  } from "vue";

DataTable.use(DataTablesCore);
DataTable.use(Responsive);
DataTable.use(Select);

const props = defineProps({
    columns: Array,
    headers: Array,
    dataURL: {
        type: String,
        value: ""
    },
    addRowLabel: {
        type: String,
        value: "Add Row"
    },
    updateRowLabel: {
        type: String,
        value: "Update Row"
    },
})

const emits = defineEmits(['add-row','update-row'])

const data = ref([])
const table = ref();
const updateDisabled = ref(true);

//watch table for selection change
watch(table, ( newValue, oldValue ) => {
    if(!newValue.dt.rows({ selected: true }).length)
        updateDisabled.value = true
    else
        updateDisabled.value = false
})

const loadData = async (url:string|undefined) => {
    if(!url)
    {
        throw("Failed to load data")        
    }

    const dataResponse = await fetch(url)

    if(!dataResponse.ok)
    {
        throw("Failed to load data")        
    }

    const jsonData = await dataResponse.json()

    data.value = jsonData
}

const addNewRow = (rowData) => {
    
    data.value.push(rowData);
}

const updateRowRequest = () => {

    table.value.dt.rows({ selected: true }).every(function () {
        let row = {...this.data()};
        emits('update-row', row)
    });
}

const updateSelectedRow = (rowData) => {

    console.log("Updating table")
    table.value.dt.rows({ selected: true }).every(function () {
        this.data(rowData)
        //let row = {...rowData}
    });
}

defineExpose({
    addNewRow,
    updateSelectedRow
});

 
onMounted(function () {
    
    try{
        //load data api
        loadData(props.dataURL)
        
    } catch(err){
        alert(err)
    }
});

</script>

<style  lang="less" scoped>

</style>

<style>
    @import 'datatables.net-dt';
</style>