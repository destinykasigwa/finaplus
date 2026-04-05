<!DOCTYPE html>
<html>

<head>
    <title>Liste des comptes epargne</title>
    <style>
        /* Ajoutez ici votre mise en forme CSS pour le PDF */
        body {
            font-family: Arial, sans-serif;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        th,
        td {
            border: 1px solid #ccc;
            padding: 8px;
            text-align: left;
        }

        th {
            background-color: #f2f2f2;
        }

        thead {
            display: table-header-group;
        }

        tfoot {
            display: table-footer-group;
        }

        .hide-on-next-pages {
            display: none !important;
        }

        thead {
            display: table-header-group !important;
        }

        @media print {
            thead {
                display: none;
                /* Cache l'en-tête sur les pages suivantes */
            }
        }

        .table-container {
            page-break-inside: avoid !important;
        }

        table {
            table-layout: fixed !important;
            width: 100% !important;
        }

        table {
            border-collapse: collapse !important;
            width: 100% !important;
        }

        table,
        th,
        /* td {
            border: 1px solid black !important;
        } */

        th,
        td {
            font-size: 10px !important;
            /* Réduire la taille du texte */
            padding: 4px !important;
            /* Réduire le padding */
            word-wrap: break-word !important;
            /* Permettre la coupure de texte */
        }
    </style>

</head>

<body>
    <?php
    use Illuminate\Support\Facades\DB;
    $data = DB::select('select * from company_models')[0]; ?>
    <div class="container">
        <div style="
            margin: 0 auto;
            width: 77%;
            border: 0px;
        "
            className="main-entente-container">

            <br />
            <br />
            <div style= "text-align: center">
                <h4>
                    <b>{{ $data->denomination }}</b>
                </h4>
            </div>
            <div class="table-container">
                <table id="table" class="table entente-container" align="center">
                    <tr>
                        <td style="border: 0px">

                            <img style="
                            width: 35%;
                            height: 90px;
                        "
                                src="uploads/images/logo/{{ $data->company_logo }}" />
                        </td>
                        <td style="border: 0px">
                            <div style="text-align: center">
                                <h3>«{{ $data->sigle }}»</h3>
                                <p>
                                    {{ $data->ville }} {{ $data->pays }} <br />
                                    Téléphone: {{ $data->tel }} <br />
                                    Courriel: {{ $data->email }} <br />
                                </p>
                            </div>
                        </td>
                        <td align="right" style="border: 0px">
                            <div style="margin-left:0px">
                                <h4>
                                    <b>
                                        <img style="width: 35%;height:  90px"
                                            src="uploads/images/logo/{{ $data->company_logo }}" />
                                    </b>
                                </h4>
                            </div>
                        </td>
                    </tr>
                </table>
            </div>
        </div>
          <h2 style="text-align: center">PLAN COMPTABLE INTERNE</h2>

            @php
$sections = [
    'ACTIF' => 'SECTION 1 : COMPTE DU BILAN - ACTIF',
    'PASSIF' => 'SECTION 2 : COMPTE DU BILAN - PASSIF',
    'PRODUIT' => 'SECTION 3 : COMPTE DE RESULTAT - PRODUIT',
    'CHARGE' => 'SECTION 4 : COMPTE DE RESULTAT - CHARGE',
    'HORS BILAN' => 'SECTION 5 : COMPTE HORS BILAN'
];
@endphp

@foreach($sections as $key => $title)

    <h3>{{ $title }}</h3>

    {{-- USD --}}
    <h4>USD</h4>
    <table border="1" width="100%" cellspacing="0" cellpadding="5">
        @forelse($groupedData[$key]['USD'] as $compte)
            <tr>
                <td>{{ $compte->NumCompte }}</td>
                <td>{{ $compte->NomCompte }}</td>
            </tr>
        @empty
            <tr>
                <td colspan="2">Aucun compte USD</td>
            </tr>
        @endforelse
    </table>

    {{-- CDF --}}
    <h4>CDF</h4>
    <table border="1" width="100%" cellspacing="0" cellpadding="5">
        @forelse($groupedData[$key]['CDF'] as $compte)
            <tr>
                <td>{{ $compte->NumCompte }}</td>
                <td>{{ $compte->NomCompte }}</td>
            </tr>
        @empty
            <tr>
                <td colspan="2">Aucun compte CDF</td>
            </tr>
        @endforelse
    </table>

@endforeach

        </div>

        <br><br>

        <p>Edité par {{ auth()->user()->name }}</p>

    </div>

</body>

</html>
























