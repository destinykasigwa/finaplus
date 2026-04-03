<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>FinaPlus</title>
    <link rel="icon" href="{{ asset('images/bigtontine.png') }}">
    <base href="/">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css"
        integrity="sha384-rbsA2VBKQhggwzxH7pPCaAqO46MgnOM80zW1RWuH61DGLwZJEdK2Kadq2F9CUG65" crossorigin="anonymous">

    <!-- Google Font: Source Sans Pro -->
    <link rel="stylesheet"
        href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,400i,700&display=fallback">
    <!-- Font Awesome -->
    <link rel="stylesheet" href="{{ asset('template/plugins/fontawesome-free/css/all.min.css') }}">
    <!-- Ionicons -->
    <link rel="stylesheet" href="https://code.ionicframework.com/ionicons/2.0.1/css/ionicons.min.css">
    <!-- Tempusdominus Bootstrap 4 -->
    <link rel="stylesheet"
        href="{{ asset('template/plugins/tempusdominus-bootstrap-4/css/tempusdominus-bootstrap-4.min.css') }}">
    <!-- iCheck -->
    <link rel="stylesheet" href="{{ asset('template/plugins/icheck-bootstrap/icheck-bootstrap.min.css') }}">
    <!-- JQVMap -->
    <link rel="stylesheet" href="{{ asset('template/plugins/jqvmap/jqvmap.min.css') }}">
    <!-- Theme style -->
    <link rel="stylesheet" href="{{ asset('template/dist/css/adminlte.min.css') }}">
    <!-- overlayScrollbars -->
    <link rel="stylesheet" href="{{ asset('template/plugins/overlayScrollbars/css/OverlayScrollbars.min.css') }}">
    <!-- Daterange picker -->
    <link rel="stylesheet" href="{{ asset('template/plugins/daterangepicker/daterangepicker.css') }}">
    <!-- summernote -->
    <link rel="stylesheet" href="{{ asset('template/plugins/summernote/summernote-bs4.min.css') }}">
    <link rel="stylesheet" href="{{ asset('css/style.css') }}">

    @viteReactRefresh
    @vite('resources/js/app.jsx')

    <style>
        :root {
            --primary-color: #20c997;
            --primary-dark: #198764;
            --secondary-color: #138496;
            --dark-bg: #0a0a0a;
            --light-bg: #f8f9fa;
        }

        /* Styles généraux */
        body {
            font-family: 'Source Sans Pro', 'Tahoma', sans-serif !important;
            background-color: var(--light-bg);
        }

        /* Header principal amélioré */
        .main-header {
            background:#138496;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
            border-bottom: 1px solid rgba(32, 201, 151, 0.3);
        }

        .main-header .nav-link {
            color: rgba(255, 255, 255, 0.9) !important;
            transition: all 0.3s ease;
            border-radius: 8px;
            margin: 0 2px;
        }

        .main-header .nav-link:hover {
            color: var(--primary-color) !important;
            background: rgba(32, 201, 151, 0.15);
            transform: translateY(-1px);
        }

        /* Navigation secondaire moderne avec menu centré */
        .navbar-modern {
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%) !important;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            border-bottom: 2px solid var(--primary-color);
            position: sticky;
            top: 0;
            z-index: 1020;
        }

        .navbar-modern .navbar-brand {
            font-weight: bold;
            font-size: 1.5rem;
            background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            transition: all 0.3s ease;
        }

        .navbar-modern .navbar-brand:hover {
            transform: scale(1.05);
        }

        /* Menu centré */
        .navbar-modern .navbar-nav {
            margin: 0 auto;
        }

        .navbar-modern .nav-link {
            color: rgba(255, 255, 255, 0.85) !important;
            font-weight: 500;
            font-size: 0.85rem;
            padding: 0.75rem 1rem !important;
            transition: all 0.3s ease;
            position: relative;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .navbar-modern .nav-link:hover {
            color: var(--primary-color) !important;
            background: rgba(32, 201, 151, 0.1);
            transform: translateY(-2px);
        }

        .navbar-modern .nav-link.active {
            color: var(--primary-color) !important;
        }

        .navbar-modern .nav-link.active::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 50%;
            transform: translateX(-50%);
            width: 60%;
            height: 3px;
            background: var(--primary-color);
            border-radius: 3px;
            animation: slideIn 0.3s ease;
        }

        @keyframes slideIn {
            from {
                width: 0;
                opacity: 0;
            }
            to {
                width: 60%;
                opacity: 1;
            }
        }

        /* Dropdown moderne */
        .dropdown-menu-modern {
            border: none;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
            padding: 0.5rem 0;
            margin-top: 0.5rem;
            animation: fadeInDown 0.3s ease;
            background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%);
            border: 1px solid rgba(32, 201, 151, 0.2);
        }

        .dropdown-menu-modern .dropdown-item {
            padding: 0.6rem 1.5rem;
            font-size: 0.85rem;
            transition: all 0.2s ease;
            color: rgba(255, 255, 255, 0.85);
        }

        .dropdown-menu-modern .dropdown-item:hover {
            background: linear-gradient(90deg, rgba(32, 201, 151, 0.15), transparent);
            color: var(--primary-color);
            padding-left: 1.8rem;
        }

        .dropdown-menu-modern .dropdown-header {
            color: var(--primary-color);
            font-weight: bold;
            border-bottom: 1px solid rgba(32, 201, 151, 0.2);
            margin-bottom: 5px;
        }

        /* Bouton menu mobile */
        .navbar-toggler-modern {
            border: none;
            background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
            color: white;
            padding: 0.5rem 1.2rem;
            border-radius: 10px;
            transition: all 0.3s ease;
        }

        .navbar-toggler-modern:hover {
            transform: scale(1.05);
            box-shadow: 0 4px 12px rgba(32, 201, 151, 0.4);
        }

        /* Animation */
        @keyframes fadeInDown {
            from {
                opacity: 0;
                transform: translateY(-15px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        /* Logo et marque */
        .brand-wrapper {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .brand-icon {
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(32, 201, 151, 0.3);
            transition: all 0.3s ease;
        }

        .brand-icon:hover {
            transform: rotate(5deg) scale(1.05);
        }

        .brand-icon i {
            font-size: 20px;
            color: white;
        }

        /* Responsive */
        @media (max-width: 991.98px) {
            .navbar-modern .navbar-collapse {
                background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
                border-radius: 16px;
                padding: 1rem;
                margin-top: 1rem;
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
                border: 1px solid rgba(32, 201, 151, 0.2);
            }
            
            .navbar-modern .navbar-nav {
                margin: 0;
            }
            
            .navbar-modern .nav-link {
                padding: 0.75rem !important;
                border-radius: 10px;
                text-align: center;
            }
            
            .navbar-modern .nav-link.active::after {
                display: none;
            }
            
            .navbar-modern .nav-link.active {
                background: linear-gradient(90deg, rgba(32, 201, 151, 0.2), transparent);
            }
            
            .dropdown-menu-modern {
                background: rgba(26, 26, 26, 0.95);
                margin-left: 15px;
            }
        }

        @media (max-width: 768px) {
            .main-header .nav-link {
                padding: 0.5rem 0.75rem;
                font-size: 0.85rem;
            }
            
            .navbar-modern .navbar-brand {
                font-size: 1.2rem;
            }
            
            .brand-icon {
                width: 32px;
                height: 32px;
            }
            
            .brand-icon i {
                font-size: 16px;
            }
        }

        /* Badge notifications */
        .badge-notification {
            position: relative;
        }
        
        .badge-notification::after {
            content: '';
            position: absolute;
            top: 5px;
            right: 5px;
            width: 8px;
            height: 8px;
            background: #ff4757;
            border-radius: 50%;
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0% {
                transform: scale(1);
                opacity: 1;
            }
            50% {
                transform: scale(1.2);
                opacity: 0.7;
            }
            100% {
                transform: scale(1);
                opacity: 1;
            }
        }

        /* Effet de brillance au survol des dropdown */
        .dropdown-toggle::after {
            transition: transform 0.3s ease;
        }
        
        .dropdown-toggle:hover::after {
            transform: rotate(180deg);
        }
    </style>
</head>

<body>
    <!-- Navbar principale -->
    <nav class="main-header navbar navbar-expand">
        <div class="container-fluid">
            <!-- Left navbar links -->
            <ul class="navbar-nav">
                <li class="nav-item">
                    <a class="nav-link" data-widget="pushmenu" href="#" role="button">
                        <i class="fas fa-bars"></i>
                    </a>
                </li>
                <li class="nav-item">
                    <a href="eco/home" class="nav-link">
                        <i class="fas fa-home me-1"></i>
                        Accueil
                    </a>
                </li>
            </ul>

            <!-- Right navbar links -->
            <ul class="navbar-nav ms-auto">
                <li class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle" href="#" id="userDropdown" data-toggle="dropdown" 
                       aria-haspopup="true" aria-expanded="false">
                        <i class="fas fa-user-circle me-1"></i>
                        <span class="d-none d-md-inline">{{ auth()->user()->name ?? 'Utilisateur' }}</span>
                    </a>
                    <div class="dropdown-menu dropdown-menu-end dropdown-menu-modern" aria-labelledby="userDropdown">
                        <h6 class="dropdown-header text-center">
                            <i class="fas fa-user-circle me-2"></i>
                            {{ auth()->user()->name ?? 'Utilisateur' }}
                        </h6>
                        {{-- <div class="dropdown-divider"></div> --}}
                        @if (!auth()->user())
                            <a href="{{ route('auth.login') }}" class="dropdown-item">
                                <i class="fas fa-sign-in-alt me-2"></i>
                                Connexion
                            </a>
                        @endif
                        <a style="cursor: pointer" class="dropdown-item" onclick="document.getElementById('logout-form').submit()">
                            <i class="fas fa-sign-out-alt me-2"></i>
                            Déconnexion
                        </a>
                        <form action="{{ route('auth/logout') }}" method="POST" id="logout-form">@csrf</form>
                    </div>
                </li>
            </ul>
        </div>
    </nav>

    <!-- Navigation secondaire avec menu centré -->
    <nav class="navbar navbar-expand-lg navbar-modern sticky-top">
        <div class="container-fluid">
            <!-- Logo à gauche -->
            <div class="brand-wrapper">
                <div class="brand-icon">
                    <i class="fas fa-chart-line"></i>
                </div>
                <a class="navbar-brand" href="eco/home">
                    <strong>FinaPlus</strong>
                </a>
            </div>
            
            <button class="navbar-toggler navbar-toggler-modern" type="button" data-toggle="collapse" 
                    data-target="#mainNavigation" aria-controls="mainNavigation" aria-expanded="false" 
                    aria-label="Toggle navigation">
                <i class="fas fa-bars"></i> Menu
            </button>
            
            <div class="collapse navbar-collapse" id="mainNavigation">
                <!-- Menu centré avec mx-auto -->
                <ul class="navbar-nav mx-auto mb-2 mb-lg-0">
                    
                    @if ($isCaissier)
                     <li class="nav-item active"><a href="/" class="nav-link"><i class="fas fa-home"></i> Home</a></li>
                        <li class="nav-item dropdown">
                           
                            <a class="nav-link dropdown-toggle" href="#" id="caisseDropdown" 
                               data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                <i class="fas fa-money-bill-wave me-1"></i> Caisse
                            </a>
                            <div class="dropdown-menu dropdown-menu-modern" aria-labelledby="caisseDropdown">
                                <a class="dropdown-item" href="{{ route('eco.pages.depot-espece') }}">
                                    <i class="fas fa-plus-circle me-2"></i>Dépôt
                                </a>
                                <a class="dropdown-item" href="{{ route('eco.pages.retrait-espece') }}">
                                    <i class="fas fa-minus-circle me-2"></i>Retrait
                                </a>
                                <a class="dropdown-item" href="{{ route('eco.pages.visa') }}">
                                    <i class="fas fa-check-circle me-2"></i>Positionnement
                                </a>
                                <a class="dropdown-item" href="{{ route('eco.pages.appro') }}">
                                    <i class="fas fa-charging-station me-2"></i>Appro
                                </a>
                                <a class="dropdown-item" href="{{ route('eco.pages.delestage') }}">
                                    <i class="fas fa-exchange-alt me-2"></i>Délestage
                                </a>
                              
                            </div>
                        </li>
                    @endif

                        @if ($isChefCaisse)
                        <li class="nav-item dropdown">
                           
                            <a class="nav-link dropdown-toggle" href="#" id="caisseDropdown" 
                               data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                <i class="fas fa-money-bill-wave me-1"></i> Tresor
                            </a>
                            <div class="dropdown-menu dropdown-menu-modern" aria-labelledby="caisseDropdown">
                                
                                <a class="dropdown-item" href="{{ route('eco.pages.appro') }}">
                                    <i class="fas fa-charging-station me-2"></i>Appro
                                </a>
                                
                                 
                                <a class="dropdown-item" href="{{ route('eco.pages.entreeT') }}">
                                    <i class="fas fa-door-open me-2"></i>Entrée T
                                </a>
                              
                            </div>
                        </li>
                    @endif
                    
                    @if ($isAgentCredit)
                        <li class="nav-item dropdown">
                            <a class="nav-link dropdown-toggle" href="#" id="creditDropdown" 
                               data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                <i class="fas fa-credit-card me-1"></i> Crédit
                            </a>
                            <div class="dropdown-menu dropdown-menu-modern" aria-labelledby="creditDropdown">
                                <a class="dropdown-item" href="{{ route('eco.pages.montage-credit') }}">
                                    <i class="fas fa-chart-line me-2"></i>Montage crédit
                                </a>
                                <a class="dropdown-item" href="{{ route('eco.pages.rapport-credit') }}">
                                    <i class="fas fa-calendar-alt me-2"></i>Rapport crédit
                                </a>
                            </div>
                        </li>
                    @endif
                    
                    @if ($isAgentClientele)
                        <li class="nav-item dropdown">
                            <a class="nav-link dropdown-toggle" href="#" id="clienteleDropdown" 
                               data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                <i class="fas fa-users me-1"></i> Clientèle
                            </a>
                            <div class="dropdown-menu dropdown-menu-modern" aria-labelledby="clienteleDropdown">
                                <a class="dropdown-item" href="{{ route('eco.pages.adhesion-membre') }}">
                                    <i class="fas fa-user-plus me-2"></i>Adhésion membre
                                </a>
                                <a class="dropdown-item" href="{{ route('eco.pages.releve') }}">
                                    <i class="fas fa-receipt me-2"></i>Relevé de compte
                                </a>
                                <a class="dropdown-item" href="{{ route('eco.pages.sommaire-compte') }}">
                                    <i class="fas fa-chart-pie me-2"></i>Sommaire de compte
                                </a>
                            </div>
                        </li>
                    @endif
                    
                    <li class="nav-item">
                        <a href="{{ route('eco.pages.releve') }}" class="nav-link">
                            <i class="fas fa-file-alt me-1"></i> Relevé
                        </a>
                    </li>
                    
                    <li class="nav-item">
                        <a href="{{ route('eco.pages.sms-banking') }}" class="nav-link">
                            <i class="fas fa-sms me-1"></i> SMS Banking
                        </a>
                    </li>
                    
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle" href="#" id="rapportDropdown" 
                           data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <i class="fas fa-chart-bar me-1"></i> Rapport
                        </a>
                        <div class="dropdown-menu dropdown-menu-modern" aria-labelledby="rapportDropdown">
                            <a class="dropdown-item" href="{{ route('eco.pages.balance') }}">
                                <i class="fas fa-balance-scale me-2"></i>Balance
                            </a>
                            <a class="dropdown-item" href="{{ route('eco.pages.bilan') }}">
                                <i class="fas fa-chart-line me-2"></i>Bilan
                            </a>
                              <a class="dropdown-item" href="{{ route('eco.pages.grandlivre') }}">
                                <i class="fas fa-book me-3"></i>Grand Livre
                            </a>
                            <a class="dropdown-item" href="{{ route('eco.pages.tfr') }}">
                                <i class="fas fa-file-invoice me-2"></i>TFR
                            </a>
                            <a class="dropdown-item" href="{{ route('eco.pages.releve') }}">
                                <i class="fas fa-receipt me-2"></i>Relevé
                            </a>
                            <a class="dropdown-item" href="{{ route('eco.pages.rapport-credit') }}">
                                <i class="fas fa-credit-card me-2"></i>Rapport crédit
                            </a>
                            <a class="dropdown-item" href="{{ route('eco.pages.journal') }}">
                                <i class="fas fa-book me-2"></i>Journal
                            </a>
                            <a class="dropdown-item" href="{{ route('eco.pages.repertoire') }}">
                                <i class="fas fa-address-book me-2"></i>Répertoire C
                            </a>
                            <a class="dropdown-item" href="{{ route('eco.pages.remboursement-attendu') }}">
                                <i class="fas fa-hourglass-half me-2"></i>Remboursement attendu
                            </a>
                            <a class="dropdown-item" href="{{ route('eco.pages.sommaire-compte') }}">
                                <i class="fas fa-chart-pie me-2"></i>Sommaire de compte
                            </a>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    </nav>

    <div class="d-flex flex-column min-vh-100">
        <main class="flex-grow-1" style="flex: 1;">
            <!-- Contenu principal de la page -->
   