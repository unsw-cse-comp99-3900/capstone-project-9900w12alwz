import LanguageSwitcher from "./components/LanguageSwitcher";
import MyComp from "./components/MyComp";
import ThemeSwitcher from "./components/ThemeSwitcher";

import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import './App.css';

const App = () => {

  return (
    <div>
      <MyComp></MyComp>
      <LanguageSwitcher/>
      <ThemeSwitcher/>
    </div>
  )
    ;
}

export default App;
