// import React from "react";

// class ExportData extends React.Component {
//     exportData = () => {
//         // Sample data to export
//         const data = [
//             { id: 1, name: "John", age: 25 },
//             { id: 2, name: "Alice", age: 30 },
//             { id: 3, name: "Bob", age: 35 },
//         ];

//         // Convert data to CSV format
//         const csvData = this.convertToCSV(data);

//         // Create a Blob object
//         const blob = new Blob([csvData], { type: "text/csv" });

//         // Create a temporary URL for the Blob
//         const url = URL.createObjectURL(blob);

//         // Create a link element
//         const link = document.createElement("a");
//         link.href = url;
//         link.setAttribute("download", "data.csv");

//         // Simulate click to trigger the download
//         document.body.appendChild(link);
//         link.click();

//         // Cleanup
//         document.body.removeChild(link);
//         URL.revokeObjectURL(url);
//     };

//     convertToCSV = (data) => {
//         const header = Object.keys(data[0]).join(",");
//         const rows = data.map((obj) => Object.values(obj).join(",")).join("\n");
//         return `${header}\n${rows}`;
//     };

//     render() {
//         return (
//             <div>
//                 <button onClick={this.exportData}>Export Data</button>
//             </div>
//         );
//     }
// }

// export default ExportData;

import React from "react";
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";

export const ExportCSV = ({ csvData, fileName }) => {
    const fileType =
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileExtension = ".xlsx";

    const exportToCSV = (csvData, fileName) => {
        const ws = XLSX.utils.json_to_sheet(csvData);
        const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
        const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const data = new Blob([excelBuffer], { type: fileType });
        FileSaver.saveAs(data, fileName + fileExtension);
    };

    return (
        <button
            className="warning"
            onClick={(e) => exportToCSV(csvData, fileName)}
        >
            Export
        </button>
    );
};

// export const exportTableData = (tableId) => {
//     const table = document.getElementById(tableId);
//     const wb = XLSX.utils.table_to_book(table);
//     const wbout = XLSX.write(wb, { bookType: "xlsx", type: "binary" });
//     const fileName = `table_${tableId}.xlsx`;
//     saveAs(
//         new Blob([s2ab(wbout)], { type: "application/octet-stream" }),
//         fileName
//     );

//     // Utility function to convert string to array buffer
//     // const s2ab = (s) => {
//     //     const buf = new ArrayBuffer(s.length);
//     //     const view = new Uint8Array(buf);
//     //     for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xff;
//     //     return buf;
//     // };
// };
// return (
//     <button
//         className="warning"
//         onClick={(e) => exportTableData("your-table-id")}
//     >
//         Export Table
//     </button>
// );

// const exportToExcel = () => {
//     // const { data } = getReleveData;
//     const fileName = "exported_data.csv";
//     const mimeType =
//         "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
//     const header =
//         "<thead><tr><th>Date</th><th>Ref Op</th><th>CreditFc</th><th>DebitFc</th><th>Solde</th></tr></thead>";
//     const rows = getReleveData.map(
//         (item) =>
//             `<tr><td>${item.DateTransaction}</td><td>${item.NumTransaction}</td><td>${item.Creditfc}</td><td>${item.Debitfc}</td><td>${item.solde}</td></tr>`
//     );
//     const html = `<html ><head><title></title>  </head><body><table>${header}<tbody>${rows.join(
//         ""
//     )}</tbody></table></body></html>`;

//     const downloadLink = document.createElement("a");
//     document.body.appendChild(downloadLink);

//     const blob = new Blob([html], { type: mimeType });
//     const url = window.URL.createObjectURL(blob);

//     downloadLink.href = url;
//     downloadLink.download = fileName;
//     downloadLink.click();

//     document.body.removeChild(downloadLink);
//     window.URL.revokeObjectURL(url);
// };
