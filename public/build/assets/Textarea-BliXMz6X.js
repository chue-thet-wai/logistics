import{j as x}from"./app-OMC7sDlI.js";const p=({name:r,value:o="",onChange:e,placeholder:s="",rows:t=4,cols:a=50,className:n="",borderColor:i="border-gray-300",focusColor:u="focus:ring-primary-theme-color",rounded:m="rounded-md",shadow:c="shadow-sm"})=>{const d=`
    w-full
    px-4 py-2
    border ${i}
    ${m}
    ${c}
    focus:outline-none
    focus:ring-2
    ${u}
    transition
    duration-150
    ease-in-out
  `;return x.jsx("textarea",{name:r,value:o,onChange:e,placeholder:s,rows:t,cols:a,className:d+" "+n})};export{p as T};
