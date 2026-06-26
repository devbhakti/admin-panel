import fs from 'fs';
const langs = ['en','hi','mr'];
langs.forEach(l => {
  const p = `c:/Users/admin/Downloads/DevBhakti-master/DevBhakti-master/devbhakti-frontend/src/locales/${l}.json`;
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  
  if (!data.navbar) {
    data.navbar = {};
  }
  data.navbar.mandals = l === 'en' ? 'Mandals' : l === 'hi' ? 'मंडल' : 'मंडळे';
  data.navbar.mandal_register = l === 'en' ? 'Mandal Registration' : l === 'hi' ? 'मंडल पंजीकरण' : 'मंडळ नोंदणी';
  
  fs.writeFileSync(p, JSON.stringify(data, null, 2));
});
console.log('Done');
