// // FraisTenueCompteParam.jsx
// import { useState } from 'react';

// const FraisTenueCompteParam = ({ initialFraisUSD = 0, initialFraisCDF = 0, onSave }) => {
//   const [fraisUSD, setFraisUSD] = useState(initialFraisUSD);
//   const [fraisCDF, setFraisCDF] = useState(initialFraisCDF);
//   const [isModified, setIsModified] = useState(false);

//   const handleUSDChange = (e) => {
//     const value = parseFloat(e.target.value);
//     setFraisUSD(isNaN(value) ? 0 : value);
//     setIsModified(true);
//   };

//   const handleCDFChange = (e) => {
//     const value = parseFloat(e.target.value);
//     setFraisCDF(isNaN(value) ? 0 : value);
//     setIsModified(true);
//   };

//   const handleSave = () => {
//     if (onSave) onSave(fraisUSD, fraisCDF);
//     setIsModified(false);
//   };

//   return (
//     <div className="mt-3">
//       <div className="d-flex justify-content-between align-items-center mb-2">
//         <label className="fw-semibold text-secondary" style={{ fontSize: '13px' }}>
//           <i className="fas fa-coins me-1"></i> Frais par devise
//         </label>
//         {isModified && (
//           <button
//             onClick={handleSave}
//             className="btn btn-sm btn-primary"
//             style={{ borderRadius: '20px', fontSize: '12px' }}
//           >
//             <i className="fas fa-save me-1"></i> Enregistrer
//           </button>
//         )}
//       </div>
//       <div className="row g-2">
//         <div className="col-6">
//           <div className="input-group input-group-sm">
//             <span className="input-group-text bg-light text-dark">USD</span>
//             <input
//               type="number"
//               step="0.01"
//               className="form-control"
//               value={fraisUSD}
//               onChange={handleUSDChange}
//               placeholder="0.00"
//             />
//           </div>
//           <small className="text-muted" style={{ fontSize: '11px' }}>Frais mensuels en dollars</small>
//         </div>
//         <div className="col-6">
//           <div className="input-group input-group-sm">
//             <span className="input-group-text bg-light text-dark">CDF</span>
//             <input
//               type="number"
//               step="0.01"
//               className="form-control"
//               value={fraisCDF}
//               onChange={handleCDFChange}
//               placeholder="0.00"
//             />
//           </div>
//           <small className="text-muted" style={{ fontSize: '11px' }}>Frais mensuels en francs congolais</small>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default FraisTenueCompteParam;