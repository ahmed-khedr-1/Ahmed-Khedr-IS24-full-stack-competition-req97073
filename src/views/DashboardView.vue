<template>
  <div class="dashboard">
    <DashboardTable :columns="columns" :dataURL="dataURL" :headers="headers" :addRowLabel="addRowLabel"
      :updateRowLabel="updateRowLabel" @add-row="addRow" @update-row="updateRow" ref="dashboardTable" />

    <BaseModal :modalActive="isModalActive" @close-modal="toggleModal" :header="modalHeaderTxt"
      :closeText="modalCloseTxt">
      <form @submit.prevent="validateForm">
        <div class="error-section text-red-500 font-bold" v-if="isFormError">
          {{ formErrorMsg }}
        </div>
        <div class="form-group py-2">
          <InputText class="w-full" type="text" v-model="selectedRow.productName" placeholder="Project Name" required />
        </div>
        <div class="form-group py-2">
          <InputText class="w-full" type="text" v-model="selectedRow.scrumMasterName" placeholder="Scrum Master" required />
        </div>
        <div class="form-group py-2">
          <InputText class="w-full" type="text" v-model="selectedRow.productOwnerName" placeholder="Product Owner" required />
        </div>
        <div class="form-group w-full">
          <div class="flex my-2 w-full" v-for="(developer, index) in selectedRow.developers" :key="index">
            <InputText type="text" v-model="selectedRow.developers[index]" class="developer-fld w-full mr-2"  placeholder="Developer"
              required />
            <Button v-if="index > 0" @click="deleteDeveloperFld(index)" icon="pi pi-times" severity="danger" />
          </div>

          <Button @click="addDeveloperFld" label="Add Developer" class="mb-2 float-right" severity="info" />

        </div>
        <div class="form-group py-2">
          <Dropdown v-model="selectedRow.methodology" :options="methodologies" placeholder="Methodology"
            class="w-full md:w-14rem" required />
        </div>
        <div class="form-group py-2">
          <InputText class="w-full" type="date" v-model="selectedRow.startDate" placeholder="Start Date (YYYY-MM-DD)" required />
        </div>
        <div class="form-group">
          <Button v-if="action == Action.create" class="float-right" label="Save" type="submit" severity="info" />
          <Button v-if="action == Action.update" class="float-right" label="Update" type="submit" severity="info" />
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

  { data: 'productName', title: "Product Name", searchable:false },
  { data: 'productOwnerName', title: "Product Owner", searchable:false },
  { data: 'scrumMasterName', title: "Scrum Master" },
  { data: 'developers[, ]', title: "Developer Names" },
  { data: 'startDate', title: "Start Date", searchable:false },
  { data: 'methodology', title: "Methodology", searchable:false },
]

//Define referenced variables to refelct changes on DOM
const dataURL = ref(loadProjectsURL)
const methodologies = ref(['Agile', 'Waterfall'])
const isModalActive = ref(false)
const isFormError = ref(false)
const modalHeaderTxt = ref('')
const modalCloseTxt = ref('Close')
const formErrorMsg = ref('')
const selectedRow = ref<Project>()
const action = ref<Action>()
const dashboardTable = ref()
const addRowLabel = "Add Project"
const updateRowLabel = "Update Selected Project"


// show/hide modal flag
const toggleModal = () => {
  isModalActive.value = !isModalActive.value
}

//Handles add project request and displays new project form
const addRow = () => {

  modalHeaderTxt.value = "Add Project"
  selectedRow.value = initNewProjectObj()
  isModalActive.value = true
  action.value = Action.create
}

//Handles update project request and displays update project form
const updateRow = (rowData) => {

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

//Handle form validation on submission
const validateForm = () => {

  //all validation is handled by dom, so calling method based on action

  //updating date format
  if(selectedRow.value)
    selectedRow.value.startDate = selectedRow.value.startDate.replace(/-/g, "/")

  //Display modal form based on action requested
  //Note: Check action enum class for all values
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

//Handles create new project request to the server
const addNewProject = async () => {
  try {
    isFormError.value = false
    //api request to create new entry
    const response = await fetch(addProjectURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...selectedRow.value }),
    })

    if (!response.ok) {
      const errorMsg = await response.json()

      if(errorMsg?.message)
        throw(errorMsg.message)

      throw ("Failed to add project")
    }
    
    const addedProject = await response.json()
    
    //update generated id
    if(selectedRow.value)
      selectedRow.value.productId = addedProject.productId

    //update table
    dashboardTable.value.addNewRow(selectedRow.value)

    //close modal
    toggleModal()
  } catch (err) {
    isFormError.value = true
    formErrorMsg.value = String(err)
  }

}

//Handles update project request sent to the server
const updateProject = async () => {

  try{
    isFormError.value = false
    //api request to update entry
    const response = await fetch(updateProjectURL +`/${selectedRow.value?.productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...selectedRow.value }),
    })
  
    if (!response.ok) {
      const errorMsg = await response.json()

      if(errorMsg?.message)
        throw(errorMsg.message)
        
      throw ("Failed to update project")
    }
    
    //update table
    dashboardTable.value.updateSelectedRow(selectedRow.value)
  
    //close modal
    toggleModal()

  } catch (err) {
    isFormError.value = true
    formErrorMsg.value = String(err)
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

//remove developer fld from form
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