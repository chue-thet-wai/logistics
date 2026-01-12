import{j as e,L as b}from"./app-OMC7sDlI.js";import{B as u}from"./Button-CLdeAHh_.js";const p=({href:s,onClick:r,icon:a,iconColor:c="text-gray-500",hoverColor:l="hover:text-gray-700",tooltip:i="",size:n="md",shadow:d=!1,variant:t="circle",...o})=>{const x=`
    flex items-center justify-center
    ${t==="circle"?"rounded-full transition-all duration-200":""}
    ${{sm:t==="circle"?"w-6 h-6 p-1":"text-sm",md:t==="circle"?"w-8 h-8 p-2":"text-base",lg:t==="circle"?"w-10 h-10 p-3":"text-lg"}[n]}
    ${c}
    ${l}
    ${d&&t==="circle"?"shadow-md hover:shadow-lg":""}
  `,m=h=>i?e.jsxs("div",{className:"relative group",children:[h,e.jsx("span",{className:`
          absolute bottom-7 left-1/2 -translate-x-1/2 text-xs text-white 
          bg-black px-1 py-1 rounded opacity-0 group-hover:opacity-100 
          transition-opacity duration-200
        `,children:i})]}):h;return m(s?e.jsx(b,{href:s,className:x,...o,children:a}):e.jsx("button",{onClick:r,className:x,...o,children:a}))},y=({isOpen:s,onClose:r,onConfirm:a,title:c,message:l,buttonText:i="Confirm",buttonColor:n="bg-sidebar-color",buttonDisabled:d=!1,children:t})=>s?e.jsx("div",{className:"modal fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50",children:e.jsxs("div",{className:"bg-white dark:bg-secondary-dark-bg dark:text-white p-5 rounded-md shadow-md max-w-md w-full relative",children:[e.jsx("button",{onClick:r,className:"absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-gray-300 dark:bg-white text-gray-800 hover:bg-gray-400 hover:text-white",children:"×"}),e.jsx("h2",{className:"text-lg font-bold mb-4",children:c}),l&&e.jsx("p",{className:"text-gray-700 dark:text-white mb-6",children:l}),t&&e.jsx("div",{className:"mb-6",children:t}),e.jsxs("div",{className:"flex justify-end space-x-3",children:[e.jsx(u,{onClick:r,variant:"secondary",children:"Cancel"}),e.jsx(u,{onClick:a,bgColor:n,disabled:d,"data-testid":"confirm-delete",children:i})]})]})}):null;export{p as B,y as M};
