<aside class="main-sidebar sidebar-dark-primary elevation-4" style="background: transparent; box-shadow: none;">
    <!-- Main Sidebar Container - Version Modernisée -->
    <style>
        /* === SIDEBAR MODERN STYLES === */
        /* CORRECTION TOTALE DU FOND BLANC POUR SIDEBAR */
        .main-sidebar,
        .sidebar,
        .main-sidebar .sidebar {
            background: #0f172a !important;
        }

        .main-sidebar .nav-link {
            color: #cbd5e6 !important;
        }

        .main-sidebar .nav-link:hover {
            background: #1e293b !important;
            color: white !important;
        }

        .main-sidebar .nav-treeview .nav-link {
            color: #94a3b8 !important;
        }

        .main-sidebar .nav-treeview .nav-link:hover {
            background: transparent !important;
            color: #34d399 !important;
        }

        /* Brand / Logo */
        .brand-modern {
            transition: transform 0.2s ease;
        }

        .brand-modern:hover {
            transform: scale(1.02);
        }

        .brand-icon {
            width: 44px;
            height: 44px;
            background: linear-gradient(135deg, #10b981, #059669);
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 8px 16px -6px rgba(0, 0, 0, 0.3);
            transition: all 0.2s;
        }

        .brand-text {
            font-size: 1.6rem;
            font-weight: 700;
            background: linear-gradient(135deg, #34d399, #10b981);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            letter-spacing: -0.5px;
        }

        .brand-sub {
            font-size: 0.7rem;
            letter-spacing: 0.5px;
        }

        /* Navigation items */
        .nav-sidebar .nav-link {
            padding: 0.7rem 1rem;
            margin: 0.2rem 0.8rem;
            border-radius: 14px;
            transition: all 0.2s ease-in-out;
            color: #cbd5e1;
            font-weight: 500;
        }

        .nav-sidebar .nav-link:hover {
            background: rgba(255, 255, 255, 0.08);
            color: white;
            transform: translateX(4px);
        }

      /* État actif - épuré (sans fond massif) */
.nav-sidebar .nav-link.active {
    background: transparent !important;
    color: #34d399 !important;
    border-left: 2px solid #10b981;
    margin-left: 0.8rem;
    padding-left: calc(1rem - 2px);
}
/* Option : au survol, on garde le même comportement mais sans conflit */
.nav-sidebar .nav-link.active:hover {
    background: rgba(255, 255, 255, 0.05) !important;
    color: #34d399 !important;
}

        .nav-sidebar .nav-link i {
            width: 28px;
            font-size: 1.2rem;
            text-align: center;
            margin-right: 0.5rem;
        }

        /* Treeview submenu */
        .nav-treeview {
            padding-left: 1.2rem;
        }

        .nav-treeview .nav-link {
            padding: 0.5rem 1rem;
            margin: 0.1rem 0.5rem;
            font-size: 0.85rem;
        }

        .nav-treeview .nav-link i {
            font-size: 0.75rem;
            width: 24px;
            color: #94a3b8;
        }

        /* Header separator */
        .nav-header-custom {
            font-size: 0.7rem;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: 600;
            color: #64748b;
            padding: 0.5rem 1rem;
            margin-top: 1rem;
        }

        /* Badge moderne */
        .badge-modern {
            background: rgba(16, 185, 129, 0.2);
            color: #34d399;
            font-size: 0.65rem;
            padding: 0.2rem 0.5rem;
            border-radius: 20px;
            margin-left: auto;
        }

        /* User panel */
        .user-panel-modern {
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            padding: 1.2rem 0.8rem;
        }

        /* Scrollbar personnalisée (optionnel) */
        .main-sidebar::-webkit-scrollbar {
            width: 4px;
        }

        .main-sidebar::-webkit-scrollbar-track {
            background: #1e293b;
        }

        .main-sidebar::-webkit-scrollbar-thumb {
            background: #475569;
            border-radius: 10px;
        }

        /* === FIX MOBILE SIDEBAR === */
        @media (max-width: 768px) {
            .nav-sidebar .nav-link {
                display: flex;
                flex-wrap: nowrap;
                justify-content: space-between;
                align-items: center;
                gap: 0.5rem;
            }

            .nav-sidebar .nav-link i:first-child {
                width: 28px;
                flex-shrink: 0;
                font-size: 1.1rem;
            }

            .nav-sidebar .nav-link p {
                flex: 1;
                margin: 0;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .nav-sidebar .nav-link .fa-chevron-right,
            .nav-sidebar .nav-link .right {
                flex-shrink: 0;
                margin-left: auto;
                font-size: 0.7rem;
            }

            .nav-treeview .nav-link {
                padding-left: 1.5rem !important;
            }
        }

        /* Correction flèches chevauchantes en mode sidebar rétracté */
        body.sidebar-collapse .main-sidebar .nav-sidebar .nav-link {
            position: relative;
            padding-right: 1.8rem;
        }

        body.sidebar-collapse .main-sidebar .nav-sidebar .nav-link>.right,
        body.sidebar-collapse .main-sidebar .nav-sidebar .nav-link>.fa-chevron-right,
        body.sidebar-collapse .main-sidebar .nav-sidebar .nav-link>.fas.fa-angle-left {
            position: absolute !important;
            right: 0.5rem !important;
            top: 50% !important;
            transform: translateY(-50%) !important;
            margin: 0 !important;
            font-size: 0.7rem;
            opacity: 0.7;
        }

        .fa-chevron-right{
            font-size: 13px !important;
        }

        
    </style>

    <div class="sidebar" style="height: 100vh; overflow-y: auto;">
        <!-- Logo & branding modernisé -->
        <div class="user-panel-modern d-flex align-items-center justify-content-center">
            <div class="info text-center">
                <a href="eco/home" class="brand-modern d-block" style="text-decoration: none;">
                    <div class="d-flex flex-column align-items-center">
                        <div class="brand-icon mb-2">
                            <i class="fas fa-chart-line" style="font-size: 22px; color: white;"></i>
                        </div>
                        <strong class="brand-text">FinaPlus</strong>
                        <small class="brand-sub text-muted mt-1">Gestion financière</small>
                    </div>
                </a>
            </div>
        </div>

        <nav class="mt-3">
            <ul class="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu" data-accordion="false">

                @php
                    $currentUrl = url()->current();
                @endphp

                <!-- ================= CAISSE ================= -->
                @if ($isCaissier)
                    @php
                        $caisseRoutes = [
                            'eco.pages.depot-espece',
                            'eco.pages.retrait-espece',
                            'eco.pages.visa',
                            'eco.pages.delestage',
                            'eco.pages.repertoire',
                            // 'eco.pages.releve',
                            'eco.pages.appro',
                            'eco.pages.suspens'
                        ];
                        $isCaisseActive = request()->routeIs(...$caisseRoutes);
                    @endphp
                    <li class="nav-item">
                        <a href="#" class="nav-link {{ $isCaisseActive ? 'active' : '' }}">
                            <i class="fas fa-money-bill-wave"></i>
                            <p>CAISSE</p>
                            <i class="fas fa-chevron-right ms-auto"></i>
                        </a>
                        <ul class="nav nav-treeview">
                            <li class="nav-item"><a href="{{ route('eco.pages.depot-espece') }}" class="nav-link {{ request()->routeIs('eco.pages.depot-espece') ? 'active' : '' }}"><i class="fas fa-arrow-down"></i><p>Dépôt</p></a></li>
                            <li class="nav-item"><a href="{{ route('eco.pages.retrait-espece') }}" class="nav-link {{ request()->routeIs('eco.pages.retrait-espece') ? 'active' : '' }}"><i class="fas fa-arrow-up"></i><p>Retrait</p></a></li>
                            <li class="nav-item"><a href="{{ route('eco.pages.visa') }}" class="nav-link {{ request()->routeIs('eco.pages.visa') ? 'active' : '' }}"><i class="fas fa-check-circle"></i><p>Visa</p></a></li>
                            <li class="nav-item"><a href="{{ route('eco.pages.delestage') }}" class="nav-link {{ request()->routeIs('eco.pages.delestage') ? 'active' : '' }}"><i class="fas fa-exchange-alt"></i><p>Délestage</p></a></li>
                            <li class="nav-item"><a href="{{ route('eco.pages.repertoire') }}" class="nav-link {{ request()->routeIs('eco.pages.repertoire') ? 'active' : '' }}"><i class="fas fa-address-book"></i><p>Répertoire</p></a></li>
                            {{-- <li class="nav-item"><a href="{{ route('eco.pages.releve') }}" class="nav-link {{ request()->routeIs('eco.pages.releve') ? 'active' : '' }}"><i class="fas fa-file-invoice"></i><p>Relevé</p></a></li> --}}
                            <li class="nav-item"><a href="{{ route('eco.pages.appro') }}" class="nav-link {{ request()->routeIs('eco.pages.appro') ? 'active' : '' }}"><i class="fas fa-truck"></i><p>Appro</p></a></li>
                            <li class="nav-item"><a href="{{ route('eco.pages.suspens') }}" class="nav-link {{ request()->routeIs('eco.pages.suspens') ? 'active' : '' }}"><i class="fas fa-pause-circle"></i><p>Suspens</p></a></li>
                        </ul>
                    </li>
                @endif

                <!-- ================= TRESOR ================= -->
                @if ($isChefCaisse)
                    @php
                        $tresorRoutes = [
                            'eco.pages.entreeT',
                            'eco.pages.repertoire',
                            // 'eco.pages.releve',
                            'eco.pages.appro'
                        ];
                        $isTresorActive = request()->routeIs(...$tresorRoutes);
                    @endphp
                    <li class="nav-item">
                        <a href="#" class="nav-link {{ $isTresorActive ? 'active' : '' }}">
                            <i class="fas fa-landmark"></i>
                            <p>TRÉSOR</p>
                            <i class="fas fa-chevron-right ms-auto"></i>
                        </a>
                        <ul class="nav nav-treeview">
                            <li class="nav-item"><a href="{{ route('eco.pages.entreeT') }}" class="nav-link {{ request()->routeIs('eco.pages.entreeT') ? 'active' : '' }}"><i class="fas fa-sign-in-alt"></i><p>Entrée T</p></a></li>
                            <li class="nav-item"><a href="{{ route('eco.pages.repertoire') }}" class="nav-link {{ request()->routeIs('eco.pages.repertoire') ? 'active' : '' }}"><i class="fas fa-address-book"></i><p>Répertoire</p></a></li>
                            {{-- <li class="nav-item"><a href="{{ route('eco.pages.releve') }}" class="nav-link {{ request()->routeIs('eco.pages.releve') ? 'active' : '' }}"><i class="fas fa-file-invoice"></i><p>Relevé</p></a></li> --}}
                            <li class="nav-item"><a href="{{ route('eco.pages.appro') }}" class="nav-link {{ request()->routeIs('eco.pages.appro') ? 'active' : '' }}"><i class="fas fa-truck"></i><p>Appro</p></a></li>
                        </ul>
                    </li>
                @endif

                <!-- ================= COMPTABILITE ================= -->
                @if ($isComptable)
                    @php
                        $comptaRoutes = ['eco.pages.debiter'];
                        $isComptaActive = request()->routeIs(...$comptaRoutes);
                    @endphp
                    <li class="nav-item">
                        <a href="#" class="nav-link {{ $isComptaActive ? 'active' : '' }}">
                            <i class="fas fa-calculator"></i>
                            <p>COMPTABILITÉ</p>
                            <i class="fas fa-chevron-right ms-auto"></i>
                        </a>
                        <ul class="nav nav-treeview">
                            <li class="nav-item"><a href="{{ route('eco.pages.debiter') }}" class="nav-link {{ request()->routeIs('eco.pages.debiter') ? 'active' : '' }}"><i class="fas fa-book"></i><p>Opérations comptables</p></a></li>
                        </ul>
                    </li>
                @endif

                <!-- ================= GESTION CREDIT ================= -->
                @if ($isAgentCredit)
                    @php
                        $creditRoutes = [
                            'eco.pages.montage-credit',
                            'eco.pages.type-credit'
                        ];
                        $isCreditActive = request()->routeIs(...$creditRoutes);
                    @endphp
                    <li class="nav-item">
                        <a href="#" class="nav-link {{ $isCreditActive ? 'active' : '' }}">
                            <i class="fas fa-chart-line"></i>
                            <p>GESTION CRÉDIT</p>
                            <i class="fas fa-chevron-right ms-auto"></i>
                        </a>
                        <ul class="nav nav-treeview">
                            <li class="nav-item"><a href="{{ route('eco.pages.montage-credit') }}" class="nav-link {{ request()->routeIs('eco.pages.montage-credit') ? 'active' : '' }}"><i class="fas fa-layer-group"></i><p>Montage crédit</p></a></li>
                            <li class="nav-item"><a href="{{ route('eco.pages.type-credit') }}" class="nav-link {{ request()->routeIs('eco.pages.type-credit') ? 'active' : '' }}"><i class="fas fa-tags"></i><p>Type de crédit</p></a></li>
                        </ul>
                    </li>
                @endif

                <!-- ================= CLIENTELLE ================= -->
                @if ($isAgentClientele)
                    @php
                        $clienteleRoutes = ['eco.pages.adhesion-membre'];
                        $isClienteleActive = request()->routeIs(...$clienteleRoutes);
                    @endphp
                    <li class="nav-item">
                        <a href="#" class="nav-link {{ $isClienteleActive ? 'active' : '' }}">
                            <i class="fas fa-users"></i>
                            <p>CLIENTÈLE</p>
                            <i class="fas fa-chevron-right ms-auto"></i>
                        </a>
                        <ul class="nav nav-treeview">
                            <li class="nav-item"><a href="{{ route('eco.pages.adhesion-membre') }}" class="nav-link {{ request()->routeIs('eco.pages.adhesion-membre') ? 'active' : '' }}"><i class="fas fa-user-plus"></i><p>Adhésion</p></a></li>
                        </ul>
                    </li>
                @endif

                <!-- ================= RAPPORT ================= -->
                @php
                    $rapportRoutes = [
                        'eco.pages.journal',
                        'eco.pages.repertoire',
                        'eco.pages.releve',
                        'eco.pages.balance',
                        'eco.pages.bilan',
                        'eco.pages.tfr'
                    ];
                    $isRapportActive = request()->routeIs(...$rapportRoutes);
                @endphp
                <li class="nav-item">
                    <a href="#" class="nav-link {{ $isRapportActive ? 'active' : '' }}">
                        <i class="fas fa-chart-pie"></i>
                        <p>RAPPORTS</p>
                        <i class="fas fa-chevron-right ms-auto"></i>
                    </a>
                    <ul class="nav nav-treeview">
                        <li class="nav-item"><a href="{{ route('eco.pages.journal') }}" class="nav-link {{ request()->routeIs('eco.pages.journal') ? 'active' : '' }}"><i class="fas fa-scroll"></i><p>Journal</p></a></li>
                        <li class="nav-item"><a href="{{ route('eco.pages.repertoire') }}" class="nav-link {{ request()->routeIs('eco.pages.repertoire') ? 'active' : '' }}"><i class="fas fa-address-book"></i><p>Répertoire</p></a></li>
                        <li class="nav-item"><a href="{{ route('eco.pages.releve') }}" class="nav-link {{ request()->routeIs('eco.pages.releve') ? 'active' : '' }}"><i class="fas fa-file-invoice-dollar"></i><p>Relevé de compte</p></a></li>
                        <li class="nav-item"><a href="{{ route('eco.pages.balance') }}" class="nav-link {{ request()->routeIs('eco.pages.balance') ? 'active' : '' }}"><i class="fas fa-balance-scale"></i><p>Balance</p></a></li>
                        <li class="nav-item"><a href="{{ route('eco.pages.bilan') }}" class="nav-link {{ request()->routeIs('eco.pages.bilan') ? 'active' : '' }}"><i class="fas fa-chart-bar"></i><p>Bilan</p></a></li>
                        <li class="nav-item"><a href="{{ route('eco.pages.tfr') }}" class="nav-link {{ request()->routeIs('eco.pages.tfr') ? 'active' : '' }}"><i class="fas fa-percent"></i><p>TFR</p></a></li>
                    </ul>
                </li>

                <!-- ================= ADMINISTRATION ================= -->
                @php
                    $adminRoutes = ['eco.pages.cloture'];
                    $isAdminActive = request()->routeIs(...$adminRoutes);
                @endphp
                <li class="nav-item">
                    <a href="#" class="nav-link {{ $isAdminActive ? 'active' : '' }}">
                        <i class="fas fa-cogs"></i>
                        <p>ADMINISTRATION</p>
                        <i class="fas fa-chevron-right ms-auto"></i>
                    </a>
                    <ul class="nav nav-treeview">
                        <li class="nav-item"><a href="{{ route('eco.pages.cloture') }}" class="nav-link {{ request()->routeIs('eco.pages.cloture') ? 'active' : '' }}"><i class="fas fa-lock"></i><p>Clôture & Ouverture</p></a></li>
                    </ul>
                </li>

                <!-- Séparateur moderne -->
                <li class="nav-header-custom px-3 mt-2">⚙️ SYSTÈME</li>

                <!-- ================= PARAMETRE (IT only) ================= -->
                @if ($isIT)
                    @php
                        $paramRoutes = [
                            'eco.pages.utilisateurs',
                            'eco.pages.compte-param'
                        ];
                        $isParamActive = request()->routeIs(...$paramRoutes);
                    @endphp
                    <li class="nav-item">
                        <a href="#" class="nav-link {{ $isParamActive ? 'active' : '' }}">
                            <i class="fas fa-sliders-h"></i>
                            <p>PARAMÈTRES</p>
                            <i class="fas fa-chevron-right ms-auto"></i>
                        </a>
                        <ul class="nav nav-treeview">
                            <li class="nav-item"><a href="{{ route('eco.pages.utilisateurs') }}" class="nav-link {{ request()->routeIs('eco.pages.utilisateurs') ? 'active' : '' }}"><i class="fas fa-user-shield"></i><p>Utilisateurs</p></a></li>
                            <li class="nav-item"><a href="{{ route('eco.pages.compte-param') }}" class="nav-link {{ request()->routeIs('eco.pages.compte-param') ? 'active' : '' }}"><i class="fas fa-wrench"></i><p>Paramètres généraux</p></a></li>
                        </ul>
                    </li>
                @endif

                <!-- Petit badge version (optionnel) -->
                <li class="mt-4 mb-3 text-center">
                    <span class="badge-modern d-inline-block px-3 py-1">v2.0 — Sécurisé</span>
                </li>
            </ul>
        </nav>
    </div>
</aside>