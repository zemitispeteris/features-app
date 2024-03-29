import { NotFoundComponent } from './not-found/not-found.component';
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { PostListComponent } from "./posts/post-list/post-list.component";
import { PostCreateComponent } from "./posts/posts-create/post-create.component";
import { AuthGuard } from "./auth/auth.guard";

const routes: Routes = [
  { path: '', component: PostListComponent, canActivate: [AuthGuard]},
  { path: 'posts', component: PostListComponent, canActivate: [AuthGuard]},
  { path: 'create', component: PostCreateComponent, canActivate: [AuthGuard] },
  { path: 'edit/:postId', component: PostCreateComponent, canActivate: [AuthGuard] },
  { path: 'auth', loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule) },
  {path: '404', component: NotFoundComponent},
  {path: '**', redirectTo: '/404'},
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard]
})
export class AppRoutingModule {

}
