<template>
    <div class="sidebar scrollbar scrollbar_hidden">
        <nav class="sidebar_menu">
            <ul class="nav-links">
                <li><RouterLink :to="{ name: 'blogs' }"><i class="fas fa-marker"></i> <span>Blogs</span></RouterLink></li>
                <li><RouterLink :to="{ name: 'trips' }"><i class="fas fa-map-marker-alt"></i> <span>Trips</span></RouterLink></li>
                <li><RouterLink :to="{ name: 'specials' }"><i class="fas fa-star"></i> <span>Specials</span></RouterLink></li>
                <li><RouterLink :to="{ name: 'group-tours' }"><i class="fas fa-users"></i> <span>Group Tours</span></RouterLink></li>
                <li><RouterLink :to="{ name: 'accommodation' }"><i class="fas fa-home"></i> <span>Accommodation</span></RouterLink></li>
            </ul>
            <ul class="nav-links">
                <li><RouterLink :to="{ name: 'brochures' }"><i class="fas fa-file"></i> <span>Brochures</span></RouterLink></li>
                <li><RouterLink :to="{ name: 'media' }"><i class="fas fa-image"></i> <span>Media</span></RouterLink></li>
            </ul>
            <ul class="nav-links">
                <li><RouterLink :to="{ name: 'regions' }"><i class="fas fa-globe-africa"></i> <span>Regions</span></RouterLink></li>
                <li><RouterLink :to="{ name: 'countries' }"><i class="fas fa-globe-africa"></i> <span>Countries</span></RouterLink></li>
                <li><RouterLink :to="{ name: 'areas' }"><i class="fas fa-globe-africa"></i> <span>Areas</span></RouterLink></li>
                <li><RouterLink :to="{ name: 'types' }"><i class="fas fa-tag"></i> <span>Trip Types</span></RouterLink></li>
                <li><RouterLink :to="{ name: 'global' }"><i class="fas fa-pen"></i> <span>Global</span></RouterLink></li>
                <li><RouterLink :to="{ name: 'forms' }"><i class="fas fa-table"></i> <span>Forms</span></RouterLink></li>
            </ul>
        </nav>
    </div>
  </template>
  
  <script setup>


  
  </script>
  
  
  <style scoped>
    .sidebar {
        position: fixed;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: var(--padding15);
        width: 170px;

        max-height: calc(100vh - (var(--navHeight) + 30px));
        overflow-y: scroll;
    }

    .sidebar.active {
        .nav-links li a {
            display: block;
        }
    }

    @media (max-width: 1024px) {
        .sidebar {
            width: auto;
        }
        .nav-links span {
                    display: none;
                }
            }

  </style>