import { Component, OnInit, ɵCodegenComponentFactoryResolver, OnDestroy } from "@angular/core";
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PostService } from '../posts.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Post } from '../post.model';
import { Subscription } from "rxjs";
import { AuthService } from '../../auth/auth.service'
import { mimeType } from "./mime-type.validator";
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
})
export class PostCreateComponent implements OnInit, OnDestroy {

  enteredTitle = ''
  post: Post
  isLoading = false
  date
  form: FormGroup
  imagePreview: string
  currentDate = new Date().toLocaleDateString();
  showDate: Date
  private mode = 'create'
  private postId: string
  private authStatusSub: Subscription

  constructor(
    public postsService: PostService,
    public route: ActivatedRoute,
    private authService: AuthService,
    public datePipe: DatePipe
  ) { }

  ngOnInit(): void {
    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe(
        authStatus => {
          this.isLoading = false
        }
      )
    this.form = new FormGroup({
      'title': new FormControl(null, {
        validators: [
          Validators.required,
          Validators.minLength(3)
        ],
      }),
      'content': new FormControl(
        null, { validators: [Validators.required] }
      ),
      image: new FormControl(null, { validators: [Validators.required], asyncValidators: [mimeType] }),
      showDate: new FormControl({value: '',
        disabled: true
      },),

    })
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('postId')) {
        this.mode = 'edit'
        this.postId = paramMap.get('postId')
        this.isLoading = true
        this.postsService
          .getPost(this.postId)
          .subscribe(postData => {
            this.isLoading = false
            this.post = {
              id: postData._id,
              title: postData.title,
              content: postData.content,
              imagePath: postData.imagePath,
              creator: postData.creator,
              showDate: postData.showDate
            }
            this.form.setValue({
              'title': this.post.title,
              'content': this.post.content,
               image: this.post.imagePath,
               showDate: this.post.showDate
            })
          })
      }
      else {
        this.mode = 'create'
        this.postId = null
      }
    })
  }



  postDateShow(event: MatDatepickerInputEvent<Date>) {
    console.log(event.value);

    this.date = this.datePipe.transform(event.value,'M/d/yyyy');

  }

  toggleCtrState() {
    const ctrl = this.form.get('showDate');
    if (ctrl.disabled) {
      ctrl.enable();
    } else {
      ctrl.disable();
    }
  }

  onImagePicked(event: Event) {
    const file = (event.target as HTMLInputElement).files[0]
    this.form.patchValue({ image: file })
    this.form.get('image').updateValueAndValidity()
    const reader = new FileReader()
    reader.onload = () => {
      this.imagePreview = reader.result as string
    }
    reader.readAsDataURL(file)
  }


  onSavePost() {

    if (this.form.invalid) {
      return
    }

    this.isLoading = true

    if (this.mode === 'create') {
      this.postsService.addPost(
        this.form.value.title,
        this.form.value.content,
        this.form.value.image,
        this.date)
    }
    else {
      this.postsService
        .updatePost(
          this.postId,
          this.form.value.title,
          this.form.value.content,
          this.form.value.image,
          this.form.value.showDate
        )
    }


    this.form.reset()
  }

  ngOnDestroy() {
    this.authStatusSub.unsubscribe()
  }

}
