import{j as t,L as h}from"./app-DdNz8GoR.js";const y=({href:s,onClick:i,icon:r,iconColor:x="text-gray-500",hoverColor:d="hover:text-gray-700",tooltip:c="",size:m="md",shadow:u=!1,variant:e="circle",...l})=>{const o=`
    flex items-center justify-center
    ${e==="circle"?"rounded-full transition-all duration-200":""}
    ${{sm:e==="circle"?"w-6 h-6 p-1":"text-sm",md:e==="circle"?"w-8 h-8 p-2":"text-base",lg:e==="circle"?"w-10 h-10 p-3":"text-lg"}[m]}
    ${x}
    ${d}
    ${u&&e==="circle"?"shadow-md hover:shadow-lg":""}
  `,n=a=>c?t.jsxs("div",{className:"relative group",children:[a,t.jsx("span",{className:`
          absolute bottom-7 left-1/2 -translate-x-1/2 text-xs text-white 
          bg-black px-1 py-1 rounded opacity-0 group-hover:opacity-100 
          transition-opacity duration-200
        `,children:c})]}):a;return n(s?t.jsx(h,{href:s,className:o,...l,children:r}):t.jsx("button",{onClick:i,className:o,...l,children:r}))};export{y as B};
