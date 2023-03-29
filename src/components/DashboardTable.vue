<template>
    <div class="dashboard-container p-4">
        <div class="dashboard__controls my-2">
            <Button @click="$emit('add-row')" :label="addRowLabel"  severity="info" class="mx-1" />
            <Button @click="updateRowRequest" :label="updateRowLabel" severity="info" class="mx-1"  />
        </div>
        <div class="dashboard__table">
            <DataTable class="display responsive nowrap is24-table" :options="{ select: true }" :columns="columns" :data="data" ref="table"  style="width:100%">                
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
import { defineProps, defineEmits,defineExpose, onMounted, ref } from "vue";

DataTable.use(DataTablesCore);
DataTable.use(Responsive);
DataTable.use(Select);

//initializng props used by table component
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

//loads data from api and populates table
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

// pushes newly added project to the data array
const addNewRow = (rowData) => {  
    data.value.push(rowData);
}

//Handle update row request after submitting form
const updateRowRequest = () => {

    const rows = table.value.dt.rows({ selected: true })

    if(!rows[0].length)
    {
        alert("No rows selected")
        return
    }

    let currentRow = 0
    rows.every(function () {
        if(currentRow > 0) return
        let row = {...this.data()};
        emits('update-row', row)
        currentRow++
    });
}

//updates data array after update form is submitted
const updateSelectedRow = (rowData) => {

    console.log("Updating table")

    let currentRow = 0
    table.value.dt.rows({ selected: true }).every(function () {
        if(currentRow > 0) return
        this.data(rowData)
        currentRow++
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

        //Update datatable's search field
        const searchFld = document.querySelector("[type='search']") as HTMLInputElement

        if(searchFld)
        {
            searchFld.setAttribute("placeholder", "Scrum Master/Developer")
            searchFld.style.setProperty("width", "210px")
        }
        
    } catch(err){
        alert(err)
    }
});

</script>

<style>
.select-info{
    margin-left:5px;
}
</style>

<style>
    @import 'datatables.net-dt';
</style>