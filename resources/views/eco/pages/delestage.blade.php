@include('partials.header')
<script>
    window.currentUser = @json(auth()->user());
</script>
@include('partials.sidebar')
<div class="content-wrapper">
    <section class="content">
        <div class="container-fluid">
            <div class="row" id="delestage">
              <div class="widget-spinner"></div>
            </div>
        </div>
    </section>
</div>

@include('partials.footer')
