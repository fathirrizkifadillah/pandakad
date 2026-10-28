const image = document.querySelector('#screen-image');
const hotspots = document.querySelector('#hotspots');
const pageTitle = document.querySelector('#page-title');

let screens = [];
let active = 0;
let selectedRole = 'Mahasiswa';

function goTo(index) {
  active = Math.max(0, Math.min(screens.length - 1, index));
  const screen = screens[active];
  window.scrollTo(0, 0);
  image.src = screen.src;
  image.alt = `${screen.name} · tampilan portal akademik`;
  pageTitle.textContent = screen.name;
  document.title = `${screen.name} · UNPANDA`;
  hotspots.replaceChildren();
  buildHotspots(screen);
  const url = new URL(location.href);
  url.searchParams.set('screen', String(active + 1));
  history.replaceState(null, '', url);
}

function addHotspot(screen, {x,y,w,h,label,target,onClick,className=''}) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `hotspot ${className}`.trim();
  button.setAttribute('aria-label', label);
  button.title = label;
  button.style.left = `${x / screen.w * 100}%`;
  button.style.top = `${y / screen.h * 100}%`;
  button.style.width = `${w / screen.w * 100}%`;
  button.style.height = `${h / screen.h * 100}%`;
  button.addEventListener('click', onClick || (() => goTo(target)));
  hotspots.append(button);
  return button;
}

function buildHotspots(screen) {
  if (active === 0) {
    const roles = [
      {name:'Admin',x:752,target:1},
      {name:'Dosen',x:942,target:2},
      {name:'Mahasiswa',x:1131,target:3},
    ];
    for (const role of roles) {
      addHotspot(screen, {
        x:role.x,y:322,w:181,h:80,label:`Masuk sebagai ${role.name}`,className:`role-choice${selectedRole===role.name?' selected':''}`,
        onClick:() => {
          selectedRole = role.name;
          buildHotspots(screen);
        },
      });
    }
    addHotspot(screen, {
      x:752,y:661,w:560,h:49,label:`Masuk ke sistem sebagai ${selectedRole}`,
      onClick:() => goTo(roles.find(role=>role.name===selectedRole).target),
    });
    return;
  }

  const isAdmin = active === 1 || screen.name.startsWith('Admin —');
  const isLecturer = active === 2 || screen.name.startsWith('Dosen —') || active === 5;
  const isStudent = active === 3 || active === 4 || screen.name.startsWith('Mahasiswa —');

  if (isAdmin) {
    const links = [
      ['Dashboard',1],['Manajemen user',6],['Data master',7],['Penjadwalan',8],
      ['Periode akademik',9],['Laporan',10],['Pengaturan',11],
    ];
    links.forEach(([label,target],i)=>addHotspot(screen,{x:16,y:210+i*52,w:208,h:43,label:`Buka ${label}`,target}));
  } else if (isLecturer) {
    const links = [
      ['Dashboard',2],['Kelas diampu',12],['Jadwal mengajar',13],['Absensi',14],
      ['Input nilai',5],['Materi dan tugas',15],['Profil',16],
    ];
    links.forEach(([label,target],i)=>addHotspot(screen,{x:16,y:210+i*52,w:208,h:43,label:`Buka ${label}`,target}));
  } else if (isStudent) {
    const links = [
      ['Dashboard',3],['KRS',4],['Jadwal kuliah',17],['Nilai',18],['Presensi',19],['Profil',20],
    ];
    links.forEach(([label,target],i)=>addHotspot(screen,{x:16,y:210+i*52,w:208,h:43,label:`Buka ${label}`,target}));
  }

  const logoutY = isStudent ? 708 : 748;
  addHotspot(screen,{x:16,y:logoutY,w:208,h:46,label:'Keluar dan kembali ke halaman masuk',target:0});

  if (active === 1) {
    addHotspot(screen,{x:1250,y:170,w:160,h:50,label:'Tambah jadwal',target:8});
    addHotspot(screen,{x:1070,y:170,w:175,h:50,label:'Unduh laporan',target:10});
    addHotspot(screen,{x:1072,y:625,w:312,h:50,label:'Kelola periode akademik',target:9});
  }
  if (active === 2) {
    addHotspot(screen,{x:1048,y:170,w:200,h:50,label:'Lihat jadwal mengajar',target:13});
    addHotspot(screen,{x:930,y:410,w:110,h:50,label:'Lihat semua kelas',target:12});
    addHotspot(screen,{x:870,y:995,w:165,h:48,label:'Input nilai mahasiswa',target:5});
  }
  if (active === 3) {
    addHotspot(screen,{x:1230,y:170,w:180,h:50,label:'Buat rencana studi',target:4});
    addHotspot(screen,{x:1160,y:260,w:230,h:65,label:'Lanjutkan pengisian KRS',target:4});
    addHotspot(screen,{x:900,y:550,w:160,h:42,label:'Jadwal kuliah lengkap',target:17});
  }
  if (active === 4) {
    addHotspot(screen,{x:1150,y:250,w:220,h:60,label:'Ajukan rencana studi',target:4});
  }
}

window.addEventListener('keydown',event=>{
  if (event.altKey && event.key === 'ArrowRight') { event.preventDefault(); goTo((active+1)%screens.length); }
  if (event.altKey && event.key === 'ArrowLeft') { event.preventDefault(); goTo((active+screens.length-1)%screens.length); }
});

fetch('screens.json').then(response=>response.json()).then(data=>{
  screens = data;
  const requested = Number(new URLSearchParams(location.search).get('screen')) - 1;
  const initial = Number.isInteger(requested) && requested>=0 && requested<screens.length ? requested : 0;
  goTo(initial);
}).catch(error=>{
  pageTitle.textContent='Desain gagal dimuat';
  console.error(error);
});
