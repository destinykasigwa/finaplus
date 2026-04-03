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
        td {
            border: 1px solid black !important;
        }

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
        <h1 style="text-align: center">Liste des comptes epargnes</h1>
        {{-- <p>Date de début : {{ $date_debut_balance }}</p>
        <p>Date de fin : {{ $date_fin_balance }}</p> --}}
        <table>
            @foreach ($fetchData as $data)
                @if ($loop->first)
                    <thead class="{{ $loop->first ? '' : 'hide-on-next-pages' }}">
                        <tr>
                            <th>NumCompte</th>
                            <th>NomCompte</th>
                            <th>Genre</th>
                            <th>NumAbregé</th>
                            <th>Solde</th>
                            <th>Dévise</th>
                            <th>DateDernièreTrans.</th>
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
                        <td>{{ $data['sexe'] }}</td>
                        <td>{{ $data['NumAdherant'] }}</td>
                        <td>{{ $data['solde'] }}</td>
                        <td>{{ $data['CodeMonnaie'] == 1 ? 'USD' : 'CDF' }}</td>
                        <td>{{ $data['derniere_date_transaction'] }}</td>
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
