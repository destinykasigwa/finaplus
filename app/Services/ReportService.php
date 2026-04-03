<?php

namespace App\Services;

use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Style\Border;
use Maatwebsite\Excel\Concerns\WithHeadings;
use PhpOffice\PhpSpreadsheet\Style\Alignment;

class ReportService
{
    /**
     * Générer un rapport en fonction du format demandé.
     *
     * @param string $type
     * @param array $data
     * @param string $view
     * @param string $filename
     * @return mixed
     */
    public function generateReport(string $type, array $data, string $view, string $filename)
    {
        if ($type === 'pdf') {
            return $this->generatePDF($data, $view, $filename);
        }

        // if ($type === 'excel') {
        //     return $this->generateExcelWithHeaders($data, $filename);
        // }

        throw new \InvalidArgumentException('Type de rapport non pris en charge.');
    }

    /**
     * Générer un fichier PDF.
     *
     * @param array $data
     * @param string $view
     * @param string $filename
     * @return \Symfony\Component\HttpFoundation\BinaryFileResponse
     */
    private function generatePDF(array $data, string $view, string $filename)
    {
        $pdf = Pdf::loadView($view, $data);
        return $pdf->download($filename . '.pdf');
    }

    /**
     * Générer un fichier Excel avec des en-têtes personnalisés.
     *
     * @param array $data
     * @param string $filename
     * @return \Symfony\Component\HttpFoundation\BinaryFileResponse
     */
    public function generateExcelWithHeaders(array $data, array $headers, string $sheetName = 'Rapport', string $filename)
    {

        return Excel::download(new class($data, $headers, $sheetName) implements FromArray, WithHeadings, WithStyles, WithTitle {
            private $data;
            private $headers;
            private $sheetName;

            public function __construct(array $data, array $headers, string $sheetName)
            {
                $this->data = $data;
                $this->headers = $headers;
                $this->sheetName = $sheetName;
            }

            public function array(): array
            {
                return $this->data;
            }

            public function headings(): array
            {
                return $this->headers;
            }

            public function title(): string
            {
                return $this->sheetName; // Nom de la feuille
            }

            // Appliquer des styles
            public function styles($sheet)
            {
                // Appliquer une couleur de fond et un texte en gras pour l'en-tête
                $sheet->getStyle('A1:' . $sheet->getHighestColumn() . '1')->applyFromArray([
                    'font' => ['bold' => true, 'color' => ['argb' => 'FFFFFF']],
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['argb' => '4CAF50'] // Couleur d'arrière-plan
                    ],
                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_CENTER,
                        'vertical' => Alignment::VERTICAL_CENTER
                    ],
                ]);

                // Appliquer des bordures autour de toutes les cellules
                $sheet->getStyle('A1:' . $sheet->getHighestColumn() . $sheet->getHighestRow())->applyFromArray([
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => Border::BORDER_THIN,
                            'color' => ['argb' => '000000'], // Bordures noires
                        ],
                    ],
                ]);
            }
        }, $filename . '.xlsx');
    }
}
