<!DOCTYPE html>
<html>

<head>
    <title>PDF Export</title>
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
        <h1 style="text-align: center">Sommaire de compte du {{ $date_debut_balance }} au {{ $date_fin_balance }}</h1>
        {{-- <p>Date de début : {{ $date_debut_balance }}</p>
        <p>Date de fin : {{ $date_fin_balance }}</p> --}}
        <table>
            @foreach ($fetchData as $data)
                @if ($loop->first)
                    <thead class="{{ $loop->first ? '' : 'hide-on-next-pages' }}">
                        <tr>
                            <th>Num Compte</th>
                            <th>Nom Compte</th>
                            <th>Solde au {{ $date_debut_balance }}</th>
                            <th>Solde {{ $date_fin_balance }}</th>
                        </tr>
                    </thead>
                @endif

                <tbody>

                    <tr>
                        {{-- <td>{{ $data['RefCadre'] }}</td>
                        <td>{{ $data['RefSousGroupe'] }}</td> --}}
                        {{-- <td>{{ $data['RefTypeCompte'] }}</td> --}}
                        <td>{{ $data['NumCompte'] }}</td>
                        <td>{{ $data['NomCompte'] }}</td>
                        <td>{{ number_format($data['soldeDebut'], 2) }}</td>
                        <td>{{ number_format($data['soldeFin'], 2) }}</td>
                    </tr>
            @endforeach
            </tbody>

        </table>
    </div>
    <br><br>
    <p>Edité par {{ auth()->user()->name }}</p>

    <script>
        window.onload = function() {
            window.print(); // Cette ligne ouvre la fenêtre d'impression automatiquement.
        }
    </script>

</body>

</html>










{{-- <html>
<head>
  <style>
    @page { margin: 100px 25px; }
    header { position: fixed; top: -60px; left: 0px; right: 0px; background-color: lightblue; height: 50px; }
    footer { position: fixed; bottom: -60px; left: 0px; right: 0px; background-color: lightblue; height: 50px; }
    p { page-break-after: always; }
    p:last-child { page-break-after: never; }
  </style>
</head>
<body>
  <header>header on each page</header>
  <footer>footer on each page</footer>
  <main>
    <p>page1</p>
    <p>page2></p>
  </main>
</body>
</html> --}}
