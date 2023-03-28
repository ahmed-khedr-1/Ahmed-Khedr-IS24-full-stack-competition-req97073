<template>
  <div class="dashboard">
    <DashboardTable :columns="columns" :dataURL="dataURL" :headers="headers" :addRowLabel="addRowLabel"
      :updateRowLabel="updateRowLabel" @add-row="addRow" @update-row="updateRow" ref="dashboardTable" />

    <BaseModal :modalActive="isModalActive" @close-modal="toggleModal" :header="modalHeaderTxt"
      :closeText="modalCloseTxt">
      <form @submit.prevent="validateForm">
        <div class="form-group">
          <InputText type="text" v-model="selectedRow.productName" placeholder="Project Name" required />
        </div>
        <div class="form-group">
          <InputText type="text" v-model="selectedRow.scrumMasterName" placeholder="Scrum Master" required />
        </div>
        <div class="form-group">
          <InputText type="text" v-model="selectedRow.productOwnerName" placeholder="Product Owner" required />
        </div>
        <div class="form-group ">
          <div v-for="(developer, index) in selectedRow.developers" :key="index">
            <InputText type="text" v-model="selectedRow.developers[index]" class="developer-fld" placeholder="Developer"
              required />
            <Button v-if="index > 0" @click="deleteDeveloperFld(index)" icon="pi pi-times" severity="danger" />
          </div>

          <Button @click="addDeveloperFld" label="Add Developer" severity="secondary" />

        </div>
        <div class="form-group">
          <Dropdown v-model="selectedRow.methodology" :options="methodologies" placeholder="Methodology"
            class="w-full md:w-14rem" required />
        </div>
        <div class="form-group">
          <InputText type="date" v-model="selectedRow.startDate" placeholder="Start Date (YYYY-MM-DD)" required />
        </div>
        <div class="form-group">
          <Button v-if="action == Action.create" label="Save" type="submit" severity="secondary" />
          <Button v-if="action == Action.update" label="Update" type="submit" severity="secondary" />
        </div>
      </form>

    </BaseModal>

  </div>
</template>

<script setup lang="ts">
import DashboardTable from "@/components/DashboardTable.vue"
import BaseModal from '@/components/BaseModal.vue';
import Project from 'types/Project'
import Action from '@/enums/Action';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import { format } from 'date-fns'
import { ref } from "vue"
import "primevue/resources/themes/lara-light-indigo/theme.css";
import "primevue/resources/primevue.min.css";
import "primeicons/primeicons.css";
import { loadProjectsURL, updateProjectURL, addProjectURL, maxDevelopersPerProject } from "@/globals/config"

//initialize table header
const columns = ref()
columns.value = [

  { data: 'productName', title: "Product Name", },
  { data: 'productOwnerName', title: "Product Owner" },
  { data: 'scrumMasterName', title: "Scrum Master" },
  { data: 'developers[, ]', title: "Developer Names" },
  { data: 'startDate', title: "Start Date" },
  { data: 'methodology', title: "Methodology" },
  //   {
  //     data: null,
  //     className: "dt-center editor-delete",
  //     defaultContent: `<div class="edit-btn"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
  //   <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
  // </svg>
  // </div>`,
  //     orderable: false,
  //     title:"Edit"
  //   },
]


const dataURL = ref(loadProjectsURL)
const methodologies = ref(['Agile', 'Waterfall'])
const isModalActive = ref(false)
const modalHeaderTxt = ref('')
const modalCloseTxt = ref('Close')
const selectedRow = ref<Project>()
const action = ref<Action>()
const dashboardTable = ref()
const addRowLabel = "Add Project"
const updateRowLabel = "Update Selected Project"

const toggleModal = () => {
  isModalActive.value = !isModalActive.value
}

const addRow = () => {
  console.log("add row called")

  modalHeaderTxt.value = "Add Project"
  selectedRow.value = initNewProjectObj()
  isModalActive.value = true
  action.value = Action.create
}

const updateRow = (rowData) => {
  console.log("update row called")

  selectedRow.value = rowData

  //reformat date and make shallow copy of developers array
  if (selectedRow.value) {
    selectedRow.value.startDate = format(new Date(selectedRow.value.startDate), 'yyyy-MM-dd')
    selectedRow.value.developers = [...rowData.developers]
  }

  modalHeaderTxt.value = "Update Project"
  isModalActive.value = true
  action.value = Action.update
}

const validateForm = () => {

  //all validation is handled by dom, so calling method based on action
  switch (action.value) {
    case Action.create:
      addNewProject()
      break
    case Action.update:
      updateProject()
      break
    default:
      console.log("Invalid action detected")

  }

}

const addNewProject = async () => {
  try {
    //api request to create new entry
    const response = await fetch(addProjectURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...selectedRow.value }),
    })

    if (!response.ok) {
      throw ("Failed to add project")
    }

    const addedProject = await response.json()

    //update generated id
    selectedRow.value!.productId = addedProject.productId

    //update table
    dashboardTable.value.addNewRow(selectedRow.value)

    //close modal
    toggleModal()
  } catch (err) {
    alert(err)
  }

}

const updateProject = async () => {

  try{
    //api request to update entry
    const response = await fetch(updateProjectURL +`/${selectedRow.value?.productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...selectedRow.value }),
    })
  
    if (!response.ok) {
      throw ("Failed to update project")
    }
    
    //update table
    dashboardTable.value.updateSelectedRow(selectedRow.value)
  
    //close modal
    toggleModal()

  } catch (err) {
    alert(err)
  }

}

//initilizes new row object
const initNewProjectObj = (): Project => {
  return {
    productName: "",
    productId: -1,
    developers: [""],
    startDate: "",
    scrumMasterName: "",
    methodology: "",
    productOwnerName: ""
  }
}

//add new developer fld to the form
const addDeveloperFld = () => {
  if (selectedRow.value && selectedRow.value.developers.length < maxDevelopersPerProject)
    selectedRow.value.developers.push("")
}

//removes developer fld from form
const deleteDeveloperFld = (index: number) => {
  if (selectedRow.value)
    selectedRow.value.developers.splice(index, 1)
}

</script>

<style>
body {
  font-family: (--font-family);
}

textarea {
  resize: none;
  width: 100%
}
</style>