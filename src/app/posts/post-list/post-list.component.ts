import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from "rxjs";
import { CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import { Post } from "../post.model";
import { PostService } from "../posts.service";
import { PageEvent } from '@angular/material/paginator';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
})
export class PostListComponent implements OnInit, OnDestroy {

  isShown: boolean = true;
  posts: Post[] = []
  test = [];
  isLoading = false
  totalPosts = 0
  postsPerPage = 2
  currentPage = 1
  currentDate = new Date().toLocaleDateString();


  pageSizeOptions = [1, 2, 5, 10]
  userIsAuthenticated = false
  userId: string
  private postSub: Subscription
  private authStatusSub: Subscription

  constructor(public postsService: PostService, private authService: AuthService) {}

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.posts, event.previousIndex, event.currentIndex);
    localStorage.setItem('posts', JSON.stringify(this.posts));
  }

  ngOnInit() {
    console.log(this.currentDate);
    this.isLoading = true
    this.postsService.getPosts(this.postsPerPage, this.currentPage)
    this.userId = this.authService.getUserId()
    this.postSub = this.postsService
      .getPostUpdateListener()
      .subscribe((postsData: { posts: Post[], postCount: number }) => {
        this.isLoading = false
        if (localStorage.getItem('posts') !== null) {
          this.posts = JSON.parse(localStorage.getItem('posts'));
          this.posts.push(postsData.posts[postsData.posts.length - 1])
          this.posts.pop();
         } else {
          this.posts = postsData.posts;
        }
      })

    this.userIsAuthenticated = this.authService.getIsAuth()

    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe(isAuthenticated => {
        this.userIsAuthenticated = isAuthenticated
        this.userId = this.authService.getUserId()
      })
  }



  togglePosts() {
    this.isShown = ! this.isShown;
  }
  ngOnDestroy() {
    this.postSub.unsubscribe()
    this.authStatusSub.unsubscribe()
  }

  onChangedPage(pageData: PageEvent) {
    this.isLoading = true
    this.currentPage = pageData.pageIndex + 1
    this.postsPerPage = pageData.pageSize
    this.postsService.getPosts(this.postsPerPage, this.currentPage)
  }


  onDelete(postId: string) {
    this.isLoading = true
    this.postsService.deletePost(postId).subscribe(() => {
      this.postsService.getPosts(this.postsPerPage, this.currentPage)
    }, () => {
      this.isLoading = false
    })
  }

}
