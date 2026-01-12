import{j as e}from"./app-OMC7sDlI.js";const b=({name:l,value:t="",onChange:a,options:n=[],placeholder:i="Select an option",className:c="",borderColor:d="border-gray-300",focusColor:u="focus:ring-primary-theme-color",rounded:m="rounded-md",shadow:x="shadow-sm",disabled:p=!1,error:r=""})=>{const s=!!r,f=`
    w-full
    px-4 py-2
    border ${s?"border-red-500":d}
    ${m}
    ${x}
    focus:outline-none
    focus:ring-2
    ${s?"focus:ring-red-500":u}
    transition
    duration-150
    ease-in-out
  `;return e.jsxs("div",{className:"w-full",children:[e.jsxs("select",{name:l,value:t,onChange:a,disabled:p,className:f+" "+c,children:[e.jsx("option",{value:"",disabled:!0,children:i}),n.map((o,h)=>e.jsx("option",{value:o.value,children:o.label},h))]}),s&&e.jsx("p",{className:"mt-1 text-sm text-red-600",children:r})]})};export{b as S};
