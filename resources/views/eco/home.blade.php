@include('partials.header')
@include('partials.sidebar')

<div class="content-wrapper" style="background: linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%); min-height: 100vh;">
    <section class="content"  style="flex: 1;">
        <div class="container-fluid px-4 py-3">
            <!-- Date Système - Style amélioré -->
            <div class="row mb-4">
                <div class="col-12">
                    <?php
                    $dateSaisie = DB::select('SELECT DateSystem FROM taux_et_date_systems ORDER BY id DESC LIMIT 1')[0];
                    $userInfo = DB::select('SELECT * FROM users WHERE id="' . Auth::user()->id . '"')[0];
                    ?> 
                    <div class="card border-0 shadow-sm rounded-3" style="background: linear-gradient(135deg, #2c3e50 0%, #1a2632 100%);">
                        <div class="card-body py-2">
                            <div class="d-flex align-items-center justify-content-between flex-wrap">
                                <div class="d-flex align-items-center">
                                    <div class="me-3">
                                        <i class="fas fa-calendar-alt text-white" style="font-size: 24px;"></i>
                                    </div>
                                    <div>
                                        <small class="text-white-50">Date système</small>
                                        <h6 class="text-white fw-bold mb-0">
                                            <?php $dataDuJour = date_create($dateSaisie->DateSystem); ?>
                                            {{ date_format($dataDuJour, 'd/m/Y') }}
                                        </h6>
                                    </div>
                                </div>
                                <div class="d-flex align-items-center mt-2 mt-sm-0">
                                    <div class="me-3">
                                        <i class="fas fa-user-circle text-white" style="font-size: 24px;"></i>
                                    </div>
                                    <div>
                                        <small class="text-white-50">Bienvenue</small>
                                        <h6 class="text-white fw-bold mb-0">{{ Auth::user()->name }}</h6>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Cartes de statistiques (si disponibles) -->
            <div class="row g-3 mb-4">
                {{-- <div class="col-12 col-sm-6 col-md-3">
                    <div class="card border-0 shadow-sm rounded-3">
                        <div class="card-body">
                            <div class="d-flex align-items-center">
                                <div class="flex-shrink-0 me-3">
                                    <div class="p-3 rounded-circle" style="background: rgba(32,201,151,0.1);">
                                        <i class="fas fa-money-bill-wave" style="color: #20c997; font-size: 24px;"></i>
                                    </div>
                                </div>
                                <div class="flex-grow-1">
                                    <h6 class="text-muted mb-1">Total Dépôts</h6>
                                    <h4 class="fw-bold mb-0">0</h4>
                                    <small class="text-success">+0%</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div> --}}
                
                {{-- <div class="col-12 col-sm-6 col-md-3">
                    <div class="card border-0 shadow-sm rounded-3">
                        <div class="card-body">
                            <div class="d-flex align-items-center">
                                <div class="flex-shrink-0 me-3">
                                    <div class="p-3 rounded-circle" style="background: rgba(220,53,69,0.1);">
                                        <i class="fas fa-hand-holding-usd" style="color: #dc3545; font-size: 24px;"></i>
                                    </div>
                                </div>
                                <div class="flex-grow-1">
                                    <h6 class="text-muted mb-1">Total Retraits</h6>
                                    <h4 class="fw-bold mb-0">0</h4>
                                    <small class="text-danger">-0%</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div> --}}
                
                {{-- <div class="col-12 col-sm-6 col-md-3">
                    <div class="card border-0 shadow-sm rounded-3">
                        <div class="card-body">
                            <div class="d-flex align-items-center">
                                <div class="flex-shrink-0 me-3">
                                    <div class="p-3 rounded-circle" style="background: rgba(23,162,184,0.1);">
                                        <i class="fas fa-users" style="color: #17a2b8; font-size: 24px;"></i>
                                    </div>
                                </div>
                                <div class="flex-grow-1">
                                    <h6 class="text-muted mb-1">Total Membres</h6>
                                    <h4 class="fw-bold mb-0">0</h4>
                                    <small class="text-info">+0 nouveaux</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div> --}}
{{--                 
                <div class="col-12 col-sm-6 col-md-3">
                    <div class="card border-0 shadow-sm rounded-3">
                        <div class="card-body">
                            <div class="d-flex align-items-center">
                                <div class="flex-shrink-0 me-3">
                                    <div class="p-3 rounded-circle" style="background: rgba(255,193,7,0.1);">
                                        <i class="fas fa-chart-line" style="color: #ffc107; font-size: 24px;"></i>
                                    </div>
                                </div>
                                <div class="flex-grow-1">
                                    <h6 class="text-muted mb-1">Chiffre d'affaires</h6>
                                    <h4 class="fw-bold mb-0">0</h4>
                                    <small class="text-warning">Ce mois</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div> --}}
            </div>

            <!-- Menu rapide - Section améliorée -->
            <div class="row mb-4">
                <div class="col-12">
                    <div class="card border-0 shadow-sm rounded-3">
                        <div class="card-header bg-white border-0 pt-3">
                            <h5 class="fw-bold mb-0" style="color: #2c3e50;">
                                <i class="fas fa-th-large me-2" style="color: #20c997;"></i>
                                Accès rapide
                            </h5>
                            <small class="text-muted">Sélectionnez une action pour commencer</small>
                        </div>
                        <div class="card-body">
                            <div class="row g-3">
                                @if ($isCaissier)
                                    <!-- Dépôt -->
                                    <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                        <a class="text-decoration-none" href="{{ route('eco.pages.depot-espece') }}">
                                            <div class="card shortcut-card border-0 shadow-sm rounded-3 transition-hover">
                                                <div class="card-body p-3">
                                                    <div class="d-flex align-items-center">
                                                        <div class="flex-shrink-0 me-3">
                                                            <div class="p-3 rounded-circle" style="background: linear-gradient(135deg, #20c997, #198764);">
                                                                <i class="fas fa-coins text-white" style="font-size: 20px;"></i>
                                                            </div>
                                                        </div>
                                                        <div class="flex-grow-1">
                                                            <h6 class="fw-bold mb-1" style="color: #2c3e50;">Dépôt</h6>
                                                            <small class="text-muted">Ajouter de l'argent</small>
                                                        </div>
                                                        <i class="fas fa-chevron-right text-muted" style="font-size: 12px;"></i>
                                                    </div>
                                                </div>
                                            </div>
                                        </a>
                                    </div>
                                    
                                    <!-- Retrait -->
                                    <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                        <a class="text-decoration-none" href="{{ route('eco.pages.retrait-espece') }}">
                                            <div class="card shortcut-card border-0 shadow-sm rounded-3 transition-hover">
                                                <div class="card-body p-3">
                                                    <div class="d-flex align-items-center">
                                                        <div class="flex-shrink-0 me-3">
                                                            <div class="p-3 rounded-circle" style="background: linear-gradient(135deg, #dc3545, #c82333);">
                                                                <i class="fas fa-hand-holding-usd text-white" style="font-size: 20px;"></i>
                                                            </div>
                                                        </div>
                                                        <div class="flex-grow-1">
                                                            <h6 class="fw-bold mb-1" style="color: #2c3e50;">Retrait</h6>
                                                            <small class="text-muted">Sortie de fonds</small>
                                                        </div>
                                                        <i class="fas fa-chevron-right text-muted" style="font-size: 12px;"></i>
                                                    </div>
                                                </div>
                                            </div>
                                        </a>
                                    </div>

                                    <!-- Visa -->
                                    <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                        <a class="text-decoration-none" href="{{ route('eco.pages.visa') }}">
                                            <div class="card shortcut-card border-0 shadow-sm rounded-3 transition-hover">
                                                <div class="card-body p-3">
                                                    <div class="d-flex align-items-center">
                                                        <div class="flex-shrink-0 me-3">
                                                            <div class="p-3 rounded-circle" style="background: linear-gradient(135deg, #17a2b8, #138496);">
                                                                <i class="fab fa-cc-visa text-white" style="font-size: 20px;"></i>
                                                            </div>
                                                        </div>
                                                        <div class="flex-grow-1">
                                                            <h6 class="fw-bold mb-1" style="color: #2c3e50;">Visa</h6>
                                                            <small class="text-muted">Positionnement</small>
                                                        </div>
                                                        <i class="fas fa-chevron-right text-muted" style="font-size: 12px;"></i>
                                                    </div>
                                                </div>
                                            </div>
                                        </a>
                                    </div>

                                    <!-- Approvisionnement -->
                                    <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                        <a class="text-decoration-none" href="{{ route('eco.pages.appro') }}">
                                            <div class="card shortcut-card border-0 shadow-sm rounded-3 transition-hover">
                                                <div class="card-body p-3">
                                                    <div class="d-flex align-items-center">
                                                        <div class="flex-shrink-0 me-3">
                                                            <div class="p-3 rounded-circle" style="background: linear-gradient(135deg, #ffc107, #e0a800);">
                                                                <i class="fas fa-arrow-circle-up text-white" style="font-size: 20px;"></i>
                                                            </div>
                                                        </div>
                                                        <div class="flex-grow-1">
                                                            <h6 class="fw-bold mb-1" style="color: #2c3e50;">Approvisionnement</h6>
                                                            <small class="text-muted">Demande d'argent</small>
                                                        </div>
                                                        <i class="fas fa-chevron-right text-muted" style="font-size: 12px;"></i>
                                                    </div>
                                                </div>
                                            </div>
                                        </a>
                                    </div>

                                    <!-- Délestage -->
                                    <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                        <a class="text-decoration-none" href="{{ route('eco.pages.delestage') }}">
                                            <div class="card shortcut-card border-0 shadow-sm rounded-3 transition-hover">
                                                <div class="card-body p-3">
                                                    <div class="d-flex align-items-center">
                                                        <div class="flex-shrink-0 me-3">
                                                            <div class="p-3 rounded-circle" style="background: linear-gradient(135deg, #6c757d, #5a6268);">
                                                                <i class="fas fa-power-off text-white" style="font-size: 20px;"></i>
                                                            </div>
                                                        </div>
                                                        <div class="flex-grow-1">
                                                            <h6 class="fw-bold mb-1" style="color: #2c3e50;">Délestage</h6>
                                                            <small class="text-muted">Clôturer la caisse</small>
                                                        </div>
                                                        <i class="fas fa-chevron-right text-muted" style="font-size: 12px;"></i>
                                                    </div>
                                                </div>
                                            </div>
                                        </a>
                                    </div>
                                @endif

                                <!-- Relevé de compte -->
                                <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                    <a class="text-decoration-none" href="{{ route('eco.pages.releve') }}">
                                        <div class="card shortcut-card border-0 shadow-sm rounded-3 transition-hover">
                                            <div class="card-body p-3">
                                                <div class="d-flex align-items-center">
                                                    <div class="flex-shrink-0 me-3">
                                                        <div class="p-3 rounded-circle" style="background: linear-gradient(135deg, #6f42c1, #5a32a3);">
                                                            <i class="fas fa-file-invoice text-white" style="font-size: 20px;"></i>
                                                        </div>
                                                    </div>
                                                    <div class="flex-grow-1">
                                                        <h6 class="fw-bold mb-1" style="color: #2c3e50;">Relevé de compte</h6>
                                                        <small class="text-muted">Voir relevé</small>
                                                    </div>
                                                    <i class="fas fa-chevron-right text-muted" style="font-size: 12px;"></i>
                                                </div>
                                            </div>
                                        </div>
                                    </a>
                                </div>

                                <!-- Adhésion -->
                                <div class="col-12 col-sm-6 col-md-4 col-lg-3">
                                    <a class="text-decoration-none" href="{{ route('eco.pages.adhesion-membre') }}">
                                        <div class="card shortcut-card border-0 shadow-sm rounded-3 transition-hover">
                                            <div class="card-body p-3">
                                                <div class="d-flex align-items-center">
                                                    <div class="flex-shrink-0 me-3">
                                                        <div class="p-3 rounded-circle" style="background: linear-gradient(135deg, #20c997, #198764);">
                                                            <i class="fas fa-user-plus text-white" style="font-size: 20px;"></i>
                                                        </div>
                                                    </div>
                                                    <div class="flex-grow-1">
                                                        <h6 class="fw-bold mb-1" style="color: #2c3e50;">Adhésion</h6>
                                                        <small class="text-muted">Nouveau membre</small>
                                                    </div>
                                                    <i class="fas fa-chevron-right text-muted" style="font-size: 12px;"></i>
                                                </div>
                                            </div>
                                        </div>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Section des opérations récentes (optionnelle) -->
            {{-- <div class="row">
                <div class="col-12">
                    <div class="card border-0 shadow-sm rounded-3">
                        <div class="card-header bg-white border-0 pt-3">
                            <h5 class="fw-bold mb-0" style="color: #2c3e50;">
                                <i class="fas fa-clock me-2" style="color: #20c997;"></i>
                                Opérations récentes
                            </h5>
                        </div>
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table table-hover">
                                    <thead style="background-color: #f8f9fa;">
                                        <tr style="color: steelblue;">
                                            <th>Date</th>
                                            <th>Type</th>
                                            <th>Montant</th>
                                            <th>Compte</th>
                                            <th>Statut</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td colspan="5" class="text-center text-muted py-4">
                                                <i class="fas fa-inbox fa-3x mb-2 opacity-50"></i>
                                                <p class="mb-0">Aucune opération récente</p>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div> --}}
        </div>
    </section>
</div>
@include('partials.footer')

<style>
    /* Styles pour la page d'accueil */
    .transition-hover {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .transition-hover:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 25px rgba(0,0,0,0.1) !important;
    }
    
    .shortcut-card {
        transition: all 0.3s ease;
        cursor: pointer;
    }
    
    .shortcut-card:hover {
        background: linear-gradient(135deg, #f8f9fa, #fff);
    }
    
    .shortcut-card:hover i.fa-chevron-right {
        transform: translateX(5px);
        transition: transform 0.3s ease;
    }
    
    /* Animation pour les cartes */
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .card {
        animation: fadeInUp 0.5s ease-out;
    }
    
    /* Responsive */
    @media (max-width: 768px) {
        .container-fluid {
            padding-left: 15px;
            padding-right: 15px;
        }
        
        .shortcut-card .p-3 {
            padding: 0.75rem !important;
        }
        
        .shortcut-card h6 {
            font-size: 14px;
        }
        
        .shortcut-card small {
            font-size: 11px;
        }
    }
    
    /* Style pour les icônes */
    .rounded-circle {
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
</style>