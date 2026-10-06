import{j as v}from"./app-DdNz8GoR.js";const S=({type:r="button",onClick:t,children:e,className:l="",variant:n="primary",padding:s="px-6 py-2",rounded:a="rounded-lg",shadow:i="shadow-md",textColor:g="",bgColor:c="",hoverColor:f="",focusColor:u="focus:ring-primary-theme-color",disabled:o=!1,...C})=>{const y={primary:{bgColor:"bg-sidebar-color",textColor:"text-white",hoverColor:"hover:bg-sidebar-color"},secondary:{bgColor:"bg-gray-300",textColor:"text-gray-900",hoverColor:"hover:bg-gray-400"}},{bgColor:x,textColor:b,hoverColor:d}=y[n],m=`
    flex items-center justify-center
    ${s}
    ${a}
    ${i}
    ${c||x}
    ${g||b}
    ${f||d}
    ${u}
    focus:outline-none
    focus:ring-2
    focus:ring-offset-2
    transition
    ease-in-out
    duration-150
    ${o?"bg-gray-400 text-gray-600 cursor-not-allowed hover:bg-gray-400":""} 
  `;return v.jsx("button",{type:r,onClick:o?null:t,className:m+" "+l,disabled:o,...C,children:e})};export{S as B};
