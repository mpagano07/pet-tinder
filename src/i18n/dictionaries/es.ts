import { Dictionary } from './en'

export const es: Dictionary = {
  common: {
    login: 'Iniciar sesión',
    signup: 'Registrarse',
    logout: 'Cerrar sesión',
    email: 'Correo Electrónico',
    password: 'Contraseña',
    username: 'Nombre de usuario',
    welcomeBack: 'Bienvenido de nuevo',
    joinCommunity: 'Únete a la comunidad',
    noAccount: '¿No tienes una cuenta?',
    hasAccount: '¿Ya tienes una cuenta?',
    createAccount: 'Crear Cuenta',
    save: 'Guardar',
    add: 'Agregar',
  },
  landing: {
    subtitle: 'La App #1 para Citas y Encuentros de Mascotas',
    titlePart1: 'Encuentra la ',
    titleGradient: 'Pareja Ideal',
    titlePart2: ' Para Tu Mascota.',
    description: 'Desliza a la derecha en posibles encuentros, conéctate con otros dueños de mascotas en tu área y crea una comunidad para tu fiel compañero.',
    cta: 'Crear Perfil de Mascota',
    features: {
      local: { title: 'Descubrimiento Local', desc: 'Encuentra mascotas cercanas usando nuestro avanzado sistema de geolocalización y filtros.' },
      chat: { title: 'Chat en Tiempo Real', desc: 'Conéctate al instante y planea encuentros con otros dueños cuando hagan match.' },
      safe: { title: 'Seguro y Confiable', desc: 'Perfiles verificados y un robusto sistema de reportes mantienen nuestra comunidad segura.' }
    }
  },
  profile: {
    title: 'Mi Perfil',
    setup: 'Configura tu perfil',
    fullName: 'Nombre Completo',
    bio: 'Biografía',
    saveProfile: 'Guardar Perfil',
    myPets: 'Mis Mascotas',
    noPets: "Aún no has agregado ninguna mascota.",
    addNewPet: 'Agregar Nueva Mascota',
    petName: 'Nombre',
    petBreed: 'Raza',
    petAge: 'Edad',
    petGender: 'Sexo',
    petMale: 'Macho',
    petFemale: 'Hembra',
    petBio: 'Biografía de la Mascota',
    addPetBtn: 'Agregar Mascota'
  },
  feed: {
    discover: 'Descubrir',
    noMorePets: 'No hay más mascotas cerca',
    noMoreDesc: "Has visto todas las mascotas en tu área. ¡Vuelve más tarde para ver más perfiles!",
    refresh: 'Actualizar',
    itsAMatch: "¡Es un Match!",
    youAnd: 'Tú y',
    likedEachOther: 'se gustaron mutuamente.',
    sendMessage: 'Enviar Mensaje',
    keepSwiping: 'Seguir Deslizando'
  },
  nav: {
    feed: 'Inicio',
    matches: 'Matches',
    profile: 'Perfil',
    services: 'Servicios'
  },
  services: {
    title: 'Servicios para Mascotas',
    subtitle: 'Encuentra lo mejor para tu mascota cerca de ti',
    search: 'Buscando servicios cercanos...',
    noResults: 'No se encontraron servicios en esta zona',
    vet: 'Veterinaria',
    shop: 'Pet Shop',
    grooming: 'Peluquería Canina',
    distance: 'de distancia',
    promoted: 'Promocionado',
    searchNearby: 'Explorar servicios cercanos'
  },
  matches: {
    title: 'Tus Matches',
    noMatches: "Aún no tienes matches. ¡Sigue deslizando!",
    chat: 'Chatear'
  },
  chat: {
    placeholder: 'Escribe un mensaje...',
    send: 'Enviar'
  },
  admin: {
    title: 'Panel Administrador',
    stats: 'Estadísticas Globales',
    totalUsers: 'Total de Usuarios',
    totalPets: 'Total de Mascotas',
    totalMatches: 'Total de Matches',
    totalSwipes: 'Total de Swipes',
    unauthorized: 'Acceso No Autorizado',
    backHome: 'Volver al Inicio'
  },
  community: {
    title: 'Comunidad',
    stats: 'Mascotas Cerca',
    events: 'Próximos Eventos',
    join: 'Unirse',
    nearby: 'cerca de ti',
    lookingFor: 'Busco compañero para...',
    createPost: 'Publicar algo',
    createEvent: 'Organizar Evento',
    compatibility: 'Compatibilidad'
  }
}
