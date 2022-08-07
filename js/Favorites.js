import { GithubUser } from "./GithubUser.js";

export class Favorite {
   constructor(root) {
      this.root = document.querySelector(root);
      this.load();
   }

   load() {
      this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || [];
   }

   save() {
      localStorage.setItem('@github-favorites:', JSON.stringify(this.entries));
   }

   async add(username) {
      try {
         const userExist = this.entries.find(entry => entry.login === username);
         const searchInput = this.root.querySelector('#searchInput');

         if(userExist) {
            searchInput.value = "";
            throw new Error(`${username} já foi adicionado na sua lista de usuários favoritos!`);
         }
         
         const user = await GithubUser.searchUser(username);

         if (user.login === undefined) {
            searchInput.value = "";
            throw new Error(`O usuário ${username} não foi encontrado!`);
         }
         
         this.entries = [user, ...this.entries];
         

         this.update();
         this.save();
         searchInput.value = "";

      } catch (error) {
         alert(error.message);
      }
   }

   delete(user) {
      this.entries = this.entries.filter(entry => entry.name !== user.name);

      this.update();
      this.save();
   }

}

export class FavoriteView extends Favorite {
   constructor(root) {
      super(root);

      this.tbody = this.root.querySelector('table tbody');
      this.update();
      this.addFavoriteUser();
   }

   addFavoriteUser() {
      const favoriteButton = this.root.querySelector('.favoriteButton');
      
      favoriteButton.onclick = () => {
         const { value } = this.root.querySelector('#searchInput');
         this.add(value);
      }
   }

   update() {
      this.removeAllTr();

      const checkEntries = this.entries.length != 0;

      if (checkEntries) {

         this.entries.forEach( user => {
            const row = this.createRow();

            row.querySelector('.user img').src = `https://github.com/${user.login}.png`;

            row.querySelector('.user img').alt = `Imagem do usuário ${user.login}`;

            row.querySelector('.user a').href = `https://github.com/${user.login}`;

            row.querySelector('.user p').textContent = `${user.name}`;

            row.querySelector('.user span').textContent = `/${user.login}`;

            row.querySelector('.repositories').textContent = `${user.public_repos}`;
            row.querySelector('.followers').textContent = `${user.followers}`;

            row.querySelector('.remove').onclick = () => {
               const isOk = confirm('Você realmente deseja excluir este usuário?');

               if (isOk) {
                  this.delete(user);
               }
            }
            
            this.tbody.append(row);
         });

      } else {
         const emptyPage = this.createEmptyFavotires();
         this.tbody.append(emptyPage);
      }
   }

   createEmptyFavotires() {
      const tr = document.createElement('tr');

      tr.innerHTML = `
         <td colspan= "4">
            <div  class="emptyPage">   
               <img src="./images/Estrela.svg" alt="Uma estrela com um rostinho">

               <h1>Nenhum favorito ainda</h1>
            </div>
         </td>
      `;
      return tr;
   }

   createRow() {
      const tr = document.createElement('tr');
      tr.innerHTML = `
         <td class="user">
            <img src="" alt="">

            <a href="" target="_blank">
               <p></p>
               <span></span>
            </a>
         </td>

         <td class="repositories"></td>

         <td class="followers"></td>

         <td><button class="remove">&times;</button></td>
      `;
      return tr;
   }

   removeAllTr() {
      this.tbody.querySelectorAll('tr').forEach(row => {
         row.remove();
      });
   }

}