<template>
  <header id="header top">
    <div class ="site_container">
      <nav class="nav-header">
        <Logo />

        <div class="user_profile">
          <div class="user_img" :class="{ logged_in: authStore.user }"
            @click="toggleMenu"
            :aria-expanded="menuOpen.toString()"
            aria-label="Toggle menu">
              <img v-if="authStore.user" :src="profilePic" alt="Profile image" />
          </div>
        </div>
              
        <!-- <button
          class="burger_container"
          @click="toggleMenu"
          :aria-expanded="menuOpen.toString()"
          aria-label="Toggle menu"
        >
          <div class="burger" :class="{ toggle: menuOpen }">
            <div class="burger-top"></div>
            <div class="burger-middle"></div>
            <div class="burger-bottom"></div>
          </div>
        </button> -->

          <div class="menu-wrapper" :class="{ active: menuOpen }" @click.self="closeMenu">
            <div class="main-menu" :class="{ active: menuOpen }">
              <div class="container">
                  
                  <div class="nav_links scrollbar_hidden">
                    <ul class="nav-links">
                      <li>
                        <div class="user_profile">
                          <div class="user_img" :class="{ logged_in: authStore.user }">
                              <img v-if="authStore.user" :src="profilePic" alt="Profile image" />
                          </div>
                          <span v-if="authStore.user">{{ authStore.user.email }}</span>
                        </div>
                      </li>
                      <li><RouterLink :to="{ name: 'admin' }"><i class="fas fa-cog"></i> <span>Admin Settings</span></RouterLink></li>
                      
                      <ul class="nav-links show-at-mob-large">
                        <li><RouterLink :to="{ name: 'blogs' }"><i class="fas fa-marker"></i> <span>Blogs</span></RouterLink></li>
                        <li><RouterLink :to="{ name: 'trips' }"><i class="fas fa-map-marker-alt"></i> <span>Trips</span></RouterLink></li>
                        <li><RouterLink :to="{ name: 'specials' }"><i class="fas fa-star"></i> <span>Specials</span></RouterLink></li>
                        <li><RouterLink :to="{ name: 'group-tours' }"><i class="fas fa-users"></i> <span>Group Tours</span></RouterLink></li>
                        <li><RouterLink :to="{ name: 'accommodation' }"><i class="fas fa-home"></i> <span>Accommodation</span></RouterLink></li>
                        <li><RouterLink :to="{ name: 'brochures' }"><i class="fas fa-file"></i> <span>Brochures</span></RouterLink></li>
                        <li><RouterLink :to="{ name: 'media' }"><i class="fas fa-image"></i> <span>Media</span></RouterLink></li>
                        <li><RouterLink :to="{ name: 'regions' }"><i class="fas fa-globe-africa"></i> <span>Regions</span></RouterLink></li>
                        <li><RouterLink :to="{ name: 'countries' }"><i class="fas fa-globe-africa"></i> <span>Countries</span></RouterLink></li>
                        <li><RouterLink :to="{ name: 'areas' }"><i class="fas fa-globe-africa"></i> <span>Areas</span></RouterLink></li>
                        <li><RouterLink :to="{ name: 'types' }"><i class="fas fa-tag"></i> <span>Trip Types</span></RouterLink></li>
                        <li><RouterLink :to="{ name: 'global' }"><i class="fas fa-pen"></i> <span>Global</span></RouterLink></li>
                        <li><RouterLink :to="{ name: 'forms' }"><i class="fas fa-table"></i> <span>Forms</span></RouterLink></li>
                      </ul>

                      <li>
                        <button class="logout" @click="authStore.logout">
                          <i class="fas fa-sign-out-alt"></i>
                          <span>Log out</span>
                        </button>
                        </li>
                      <li>
                        <div class="theme_switch">
                          <input 
                            id="checkbox"
                            type="checkbox" 
                            v-model="theme.darkMode"
                          />

                          <label for="checkbox" class="switch-label">
                            <i class="dark fas fa-moon"></i>
                            <i class="light fas fa-sun"></i>
                            <div 
                              class="switch-toggle"
                              :class="{ checked: theme.darkMode }">
                            </div>
                          </label>
                        </div>
                      </li>
                    </ul>
                  </div>
              </div>
            </div>		
          </div>
      </nav>
    </div>					     	
</header>
</template>

<script setup>
import Logo from '../Logo.vue';
import { ref, watch, computed } from 'vue';
import { useRouter } from 'vue-router'
import { useTheme } from '../../store/theme'
import { useAuthStore } from '../../store/auth'

const authStore = useAuthStore()
const theme = useTheme()
const router = useRouter()

const profilePic = computed(() => {
  const url = authStore.user?.photoURL
  if (!url) return null
  return url.replace(/=s\d+-c$/, '=s32-c')
})

const menuOpen = ref(false)

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const closeMenu = () => {
  menuOpen.value = false
}

watch(
  () => router.currentRoute.value.fullPath,
  () => (menuOpen.value = false)
)

</script>



<style scoped>
header {
  position: relative;
  z-index: 99;
  top: 0;
  left: 0;
  width: 100%;
  background: var(--background);
  border-bottom: 1px solid var(--borderColor);
  transition: all .5s ease;
}

header.sticky {
  box-shadow: var(--box-shadow);
  }

.nav-header {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: var(--gap5);
  height: calc(var(--navHeight) - 20px);
  padding: 10px var(--columnPaddingNormal) 10px;

    @media (max-width: 768px) {
    height: var(--navHeight);
  }
}

.logo {
  margin-right: auto;
}

.user_profile {
  display: flex;
  align-items: center;
  gap: var(--gap5);

  .user_img {
    background: var(--background-white-dark);
    border-radius: var(--pill);
    overflow: hidden;
    height: 32px;
    width: 32px;

    img {
      transition: var(--timingAll);
    }

    &:hover img {
      cursor: pointer;
      scale: 1.1;
      transition: var(--timingAll);

    }

    &[aria-expanded="true"] {
      box-shadow: var(--focused);
    }
  }
}


/*--- DARK MODE SWITCH ---*/
  .theme_switch {
    --element-size: 3rem;

    margin-top: -3px;

    input {
      display: none;
    }
  }

  .switch-label {
    width: var(--element-size); 
    border-radius: var(--element-size);
    border: calc(var(--element-size) * 0.025) solid var(--borderColor);
    padding: calc(var(--element-size) * 0.1);
    font-size: calc(var(--element-size) * 0.3);
    height: calc(var(--element-size) * 0.35);

    align-items: center;
    background: var(--background-white-dark);
    cursor: pointer;
    display: flex;
    position: relative;
    transition: background 0.5s ease;
    justify-content: space-between;
    z-index: 1;
  } 

  .switch-toggle {
    position: absolute;
    background-color: var(--accent);
    border-radius: 50%;
    top: calc(var(--element-size) * 0.07);
    left: calc(var(--element-size) * 0.07);
    height: calc(var(--element-size) * 0.4);
    width: calc(var(--element-size) * 0.4);
    transform: translateX(0);
    transition: transform 0.3s ease, background-color 0.5s ease;
  }

  .switch-toggle.checked {
    transform: translateX(calc(var(--element-size) * 0.65));
    background-color: var(--accent);
  }


  .menu-wrapper {
    visibility: hidden;
    position: absolute;
    right: 0;
    top: 0;
    width: 100%;
    height: 100vh;
    overflow: hidden;
  }

  .menu-wrapper.active {
    visibility: visible;
  }

  .main-menu {
    position: relative;
    transform: translateY(-100%);
    transform-origin: 50% 0;
    margin-left: auto;
    padding: 15px;
    opacity: 0;
    width: max-content;
    z-index: 9;
    transition: var(--timingAll);

    .container {
      padding: 20px;
      border-radius: 10px;
      background: var(--background-light);
      box-shadow: var(--box-shadow-large);

      @media (max-width: 1024px) {
        max-height: 70svh;
        overflow-y: scroll;
      }

      .user_profile {
        padding: var(--paddingInputs);

        .user_img {
          height: 20px;
          width: 20px;
        }
      }
    }
  }

  .main-menu.active {
    transform: translateY(60px);
    height: max-content;
    opacity: 1;
  }

  .nav-links li {
    position: relative;
    font-size: var(--fontSizeSmall);
  }

  .theme_switch {
    position: absolute;
    right: 0;
  }

  .burger_container {
    position: relative;
    height: 30px;
    width: 45px;
    background: var(--background-white-dark);
    border-radius: var(--pill);
    margin-right: -5px;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: var(--timingAll);
    border-color: var(--borderColor);

    &:hover {
      border-color: var(--accent);
    }

    &:hover .burger div {
      background-color: var(--accent);
    }

    .burger {
      position: absolute;
      display: block;
      cursor: pointer;
      z-index: 10;

      div {
        width: 17px;
        height: 2px;
        background-color: var(--borderColor);
        border-radius: 50px;
        margin: 3px;
        transition: all 0.3s ease;


      }
    }
  }

  .toggle.burger div {
    background-color: var(--accent);
  }

  .toggle .burger-middle {
      opacity: 0;
  }


  /*--- MEDIA QUERIES 767px --- */
  @media (max-width: 767px) {

  .main-menu {
    width: auto;
  }

  }




/*--------------------------------ANIMATION----------------------*/	
.toggle .burger-top {
animation: burger-top .5s ease forwards;
}	

.toggle .burger-middle{
opacity: 0;
}

.toggle .burger-bottom{
animation: burger-bottom .5s ease forwards;	
}

.toggle.burger {
  animation: burger-div .5s ease forwards;
  animation-delay: .3s ;	
}


@keyframes burger-div {
100% {	transform: rotate(180deg); }
}    

@keyframes burger-top {
0% { transform: translateY(0px); }
33% { transform: translateY(5px); }
100% {	transform: rotate(-45deg) translate(-3px,3px); }
}

@keyframes burger-bottom {
0% { transform: translateY(0px); }
33% { transform: translateY(-5px); }
100% {	transform: rotate(45deg) translate(-4px,-4px); }
}  
  

@keyframes navLinkFade {
  from {
    opacity: 0;
    transform: translateX(50px); 
}
  to {
    opacity: 1;
    transform: translateX(0px);	
}
}	

</style>