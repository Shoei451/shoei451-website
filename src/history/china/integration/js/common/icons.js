// js/icons.js
// プロジェクト共通 SVG アイコン定数
// 使い方: element.innerHTML = SVG.note  /  `${SVG.back} 戻る`

const SVG = {
  note: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8">
           <path d="M5 3h10a1 1 0 011 1v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4a1 1 0 011-1z" stroke-linecap="round"/>
           <path d="M7 7h6M7 10h6M7 13h4" stroke-linecap="round"/>
         </svg>`,
  quiz: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8">
           <circle cx="10" cy="10" r="8"/>
           <path d="M10 14v-1" stroke-linecap="round"/>
           <path d="M8 8a2 2 0 113.414 1.414L10 11" stroke-linecap="round" stroke-linejoin="round"/>
         </svg>`,
  culture: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M3 17h14M5 17V9l5-6 5 6v8" stroke-linecap="round" stroke-linejoin="round"/>
              <rect x="8" y="12" width="4" height="5" rx="0.5"/>
            </svg>`,
  back: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8">
           <path d="M3 8h10" stroke-linecap="round"/>
           <path d="M7 4l-4 4 4 4" stroke-linecap="round" stroke-linejoin="round"/>
         </svg>`,
  clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="9"/>
            <path d="M12 7v5l3 3" stroke-linecap="round"/>
          </svg>`,
  map: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M2 5l6-2 4 2 6-2v12l-6 2-4-2-6 2V5z" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M8 3v12M12 5v12" stroke-linecap="round"/>
        </svg>`,
  timeline: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8">
               <circle cx="4" cy="5" r="1.5" fill="currentColor" stroke="none"/>
               <circle cx="4" cy="10" r="1.5" fill="currentColor" stroke="none"/>
               <circle cx="4" cy="15" r="1.5" fill="currentColor" stroke="none"/>
               <path d="M8 5h9M8 10h9M8 15h6" stroke-linecap="round"/>
             </svg>`,
  chevron: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M4 6l4 4 4-4" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>`,
  search: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8">
             <circle cx="8.5" cy="8.5" r="5.5"/>
             <path d="M15 15l-3-3" stroke-linecap="round"/>
           </svg>`,
  close: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M4 4l8 8M12 4l-8 8" stroke-linecap="round"/>
          </svg>`,
};
