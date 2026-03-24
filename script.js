const { createClient } = supabase;

const supabaseClient = createClient(
"https://hgrdcvwanwtujztozdyw.supabase.co",
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhncmRjdndhbnd0dWp6dG96ZHl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3NTExODAsImV4cCI6MjA4ODMyNzE4MH0.t5ZnzZ9mCWRI9ZYy7u1csLKgDFpYhiykZif9HY5er1c"
)

let currentStep = 1;



/* ---------------- PROGRESS ---------------- */

function updateProgress(){

const fill=document.getElementById("progressFill")

const progress={
1:"33%",
2:"66%",
3:"100%"
}

fill.style.width=progress[currentStep]

}



/* ---------------- STEP NAV ---------------- */

function goToStep2(){

if(!validateForm()) return

currentStep=2
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

populateReview()

document.getElementById("step2").classList.add("hidden")
document.getElementById("step3").classList.remove("hidden")

currentStep=3
updateProgress()

}



/* ---------------- REVIEW SCREEN ---------------- */

function populateReview(){

document.getElementById("r_firstName").innerText=document.getElementById("firstName").value
document.getElementById("r_lastName").innerText=document.getElementById("lastName").value
document.getElementById("r_email").innerText=document.getElementById("email").value
document.getElementById("r_phone").innerText=document.getElementById("phone").value
document.getElementById("r_gender").innerText=document.getElementById("gender").value
document.getElementById("r_city").innerText=document.getElementById("city").value
document.getElementById("r_license").innerText=document.getElementById("license").value
document.getElementById("r_nin").innerText=document.getElementById("ninbvn").value

const selfie=document.getElementById("selfie").files[0]
const license=document.getElementById("licensePhoto").files[0]

document.getElementById("r_selfie").src=URL.createObjectURL(selfie)
document.getElementById("r_licensePhoto").src=URL.createObjectURL(license)

}



function goToStep1(){

document.getElementById("step3").classList.add("hidden")
document.getElementById("step1").classList.remove("hidden")

currentStep=1
updateProgress()

}



/* ---------------- IMAGE PREVIEW ---------------- */

function previewImage(fileInput,previewId){

const file=fileInput.files[0]

if(!file) return

if(file.size>5000000){

alert("Image must be less than 5MB")
fileInput.value=""
return

}

const reader=new FileReader()

reader.onload=function(e){

const preview=document.getElementById(previewId)

preview.src=e.target.result
preview.style.display="block"

}

reader.readAsDataURL(file)

}



/* ---------------- PAGE LOAD ---------------- */

window.onload=function(){

document.getElementById("ninbvn").addEventListener("input",function(){

this.value=this.value.replace(/\D/g,"").slice(0,11)

})

document.getElementById("selfie").addEventListener("change",function(){

previewImage(this,"selfiePreview")

})

document.getElementById("licensePhoto").addEventListener("change",function(){

previewImage(this,"licensePreview")

})

}



/* ---------------- IMAGE COMPRESSION ---------------- */

async function compressImage(file){

return new Promise(resolve=>{

const img=new Image()
const canvas=document.createElement("canvas")
const ctx=canvas.getContext("2d")

img.onload=function(){

const maxWidth=600
const scale=maxWidth/img.width

canvas.width=maxWidth
canvas.height=img.height*scale

ctx.drawImage(img,0,0,canvas.width,canvas.height)

canvas.toBlob(blob=>{

resolve(blob)

},"image/jpeg",0.7)

}

img.src=URL.createObjectURL(file)

})

}



/* ---------------- FINAL SUBMIT ---------------- */

async function finalSubmit(){

try{

document.body.style.cursor="wait"



/* ---- CHECK DUPLICATE FIRST ---- */

const email=document.getElementById("email").value

const { data:existing } = await supabaseClient
.from("drivers")
.select("email")
.eq("email",email)

if(existing && existing.length>0){

document.body.style.cursor="default"

alert("This email is already registered.")

return

}



/* ---- COMPRESS IMAGES ---- */

let selfieRaw=document.getElementById("selfie").files[0]
let licenseRaw=document.getElementById("licensePhoto").files[0]

let selfie=await compressImage(selfieRaw)
let license=await compressImage(licenseRaw)



/* ---- SAFE FILE NAMES ---- */

let selfiePath="selfies/"+Date.now()+"_selfie.jpg"
let licensePath="licenses/"+Date.now()+"_license.jpg"



/* ---- UPLOAD FILES ---- */

const upload1=await supabaseClient.storage
.from("driver-documents")
.upload(selfiePath,selfie)

if(upload1.error) throw upload1.error


const upload2=await supabaseClient.storage
.from("driver-documents")
.upload(licensePath,license)

if(upload2.error) throw upload2.error



/* ---- GET PUBLIC URL ---- */

let { data } = supabaseClient.storage
.from("driver-documents")
.getPublicUrl(selfiePath)

let selfieUrl=data.publicUrl


let { data:licenseData } = supabaseClient.storage
.from("driver-documents")
.getPublicUrl(licensePath)

let licenseUrl=licenseData.publicUrl



/* ---- INSERT DRIVER ---- */

const insert=await supabaseClient
.from("drivers")
.insert([{

first_name:document.getElementById("firstName").value,
last_name:document.getElementById("lastName").value,
email:email,
phone:document.getElementById("phone").value,
gender:document.getElementById("gender").value,
city:document.getElementById("city").value,
license_number:document.getElementById("license").value,
nin_bvn:document.getElementById("ninbvn").value,
selfie_url:selfieUrl,
license_url:licenseUrl

}])


if(insert.error) throw insert.error



/* ---- SUCCESS ---- */

document.body.style.cursor="default"

document.getElementById("successPopup")
.classList.remove("hidden")



}
catch(err){

console.error(err)

document.body.style.cursor="default"

alert("Submission failed. Try again.")

}

}

/* ---------------- Close Popup ---------------- */
function closePopup(){

document.getElementById("successPopup")
.classList.add("hidden")

setTimeout(()=>{
location.reload()
},500)

}

/* ---------------- VALIDATION ---------------- */

function validateForm(){

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
document.getElementById("genderError").innerText="Select gender"
return false
}

if(city===""){
document.getElementById("cityError").innerText="Select city"
return false
}

if(!phoneRegex.test(phone)){
document.getElementById("phoneError").innerText="Invalid phone"
return false
}

if(!licenseRegex.test(license)){
document.getElementById("licenseError").innerText="Invalid license"
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