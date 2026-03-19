const { createClient } = supabase;

const supabaseClient = createClient(
"https://hgrdcvwanwtujztozdyw.supabase.co",
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhncmRjdndhbnd0dWp6dG96ZHl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3NTExODAsImV4cCI6MjA4ODMyNzE4MH0.t5ZnzZ9mCWRI9ZYy7u1csLKgDFpYhiykZif9HY5er1c"
)

let currentStep = 1


function updateProgress(){

const fill = document.getElementById("progressFill")

const progress = {
1: "33%",
2: "66%",
3: "100%"
}

fill.style.width = progress[currentStep]

}


function goToStep2(){

if(!validateForm()) return

currentStep = 2
updateProgress()

document.getElementById("step1").classList.add("hidden")
document.getElementById("step2").classList.remove("hidden")

}


function startPayment(){

const selfie=document.getElementById("selfie").files[0]
const license=document.getElementById("licensePhoto").files[0]

if(!selfie || !license){
alert("Upload both photos")
return
}

// Populate review screen
populateReview()

document.getElementById("step2").classList.add("hidden")
document.getElementById("step3").classList.remove("hidden")

currentStep=3
updateProgress()

}

function populateReview(){

document.getElementById("r_firstName").innerText = document.getElementById("firstName").value
document.getElementById("r_lastName").innerText = document.getElementById("lastName").value
document.getElementById("r_email").innerText = document.getElementById("email").value
document.getElementById("r_phone").innerText = document.getElementById("phone").value
document.getElementById("r_gender").innerText = document.getElementById("gender").value
document.getElementById("r_city").innerText = document.getElementById("city").value
document.getElementById("r_license").innerText = document.getElementById("license").value
document.getElementById("r_nin").innerText = document.getElementById("ninbvn").value

// images
const selfie=document.getElementById("selfie").files[0]
const license=document.getElementById("licensePhoto").files[0]

document.getElementById("r_selfie").src = URL.createObjectURL(selfie)
document.getElementById("r_licensePhoto").src = URL.createObjectURL(license)

}

function goToStep1(){

document.getElementById("step3").classList.add("hidden")
document.getElementById("step1").classList.remove("hidden")

currentStep = 1
updateProgress()

}


function previewImage(fileInput, previewId){

const file = fileInput.files[0]

if(!file) return

if(file.size > 5000000){

alert("Image must be less than 5MB")
fileInput.value=""
return

}

const reader = new FileReader()

reader.onload = function(e){

const preview = document.getElementById(previewId)

preview.src = e.target.result
preview.style.display = "block"

}

reader.readAsDataURL(file)

}

function closePopup(){
    document.getElementById("successPopup").classList.add("hidden");
}

window.onload = function(){

 document.getElementById("ninbvn").addEventListener("input", function(){
this.value=this.value.replace(/\D/g,"").slice(0,11)
})

document.getElementById("selfie").addEventListener("change", function(){
previewImage(this,"selfiePreview")
})

document.getElementById("licensePhoto").addEventListener("change", function(){
previewImage(this,"licensePreview")
})

}


async function finalSubmit(){

try{

let selfie=document.getElementById("selfie").files[0]
let license=document.getElementById("licensePhoto").files[0]

let selfiePath="selfies/"+Date.now()+selfie.name
let licensePath="licenses/"+Date.now()+license.name

await supabaseClient.storage
.from("driver-documents")
.upload(selfiePath,selfie)

await supabaseClient.storage
.from("driver-documents")
.upload(licensePath,license)

let { data } = supabaseClient.storage
.from("driver-documents")
.getPublicUrl(selfiePath)

let selfieUrl=data.publicUrl

let { data:licenseData } = supabaseClient.storage
.from("driver-documents")
.getPublicUrl(licensePath)

let licenseUrl=licenseData.publicUrl

await supabaseClient.from("drivers").insert([{

first_name:document.getElementById("firstName").value,
last_name:document.getElementById("lastName").value,
email:document.getElementById("email").value,
phone:document.getElementById("phone").value,
gender:document.getElementById("gender").value,
city:document.getElementById("city").value,
license_number:document.getElementById("license").value,
nin_bvn:document.getElementById("ninbvn").value,
selfie_url:selfieUrl,
license_url:licenseUrl

}])

// show success popup
document.getElementById("successPopup").classList.remove("hidden")

}
catch(err){

console.error(err)
alert("Submission failed. Try again.")

}

}

function validateForm(){

let valid=true

const gender=document.getElementById("gender").value
const city=document.getElementById("city").value
const phone=document.getElementById("phone").value
const email=document.getElementById("email").value
const license=document.getElementById("license").value
const nin=document.getElementById("ninbvn").value

document.getElementById("genderError").innerText=""
document.getElementById("cityError").innerText=""
document.getElementById("phoneError").innerText=""
document.getElementById("licenseError").innerText=""
document.getElementById("ninError").innerText=""
document.getElementById("emailError").innerText=""

const phoneRegex=/^(\+234|234|0)[0-9]{10}$/
const licenseRegex=/^[a-zA-Z0-9]{1,12}$/
const ninRegex=/^[0-9]{11}$/
const emailRegex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/


if(gender===""){
document.getElementById("genderError").innerText="Please select gender"
return false
}

if(city===""){
document.getElementById("cityError").innerText="Please select your city"
return false
}

if(!phoneRegex.test(phone)){
document.getElementById("phoneError").innerText="Invalid phone format"
return false
}

if(!licenseRegex.test(license)){
document.getElementById("licenseError").innerText="License must be 12 characters"
return false
}

if(!ninRegex.test(nin)){
document.getElementById("ninError").innerText="NIN must be 11 digits"
return false
}

if(!emailRegex.test(email)){
document.getElementById("emailError").innerText="Invalid email"
return false
}

return true

}