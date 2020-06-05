import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UserService } from '../services/user.service';
import { AngularFireStorage } from '@angular/fire/storage';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  studentForm: FormGroup;
  studentList: any = [];
  studentDetail: any;
  snapshot: Observable<any>;
  downloadURL: Observable<string>;
  fb;
  file: any;
  loading: Boolean = false;

  constructor(
    public _userService: UserService,
    public storage: AngularFireStorage

  ) {
    this.studentForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      age: new FormControl('', [Validators.required]),
      address: new FormControl('', [Validators.required])
    })
  }

  ngOnInit() {
    this.getStudentList();
    this.getSingleStudent();

  }

  /**
   * add student
   * @param {object} data 
   */
  CreateRecord(data) {
    this.loading = true;
    console.log(data);
    var n = Date.now();
    const filePath = `${n}`;
    const fileRef = this.storage.ref(filePath);
    const task = this.storage.upload(`${n}`, this.file);
    console.log(task)
    task
      .snapshotChanges()
      .pipe(
        finalize(() => {
          this.downloadURL = fileRef.getDownloadURL();
          this.downloadURL.subscribe(url => {
            if (url) {
              this.fb = url;
            }
            console.log(this.fb);
            data['image'] = this.fb;
            this._userService.createStudent(data).then((res) => {
              console.log("add studenet", res);
              this.loading = false;
              this.studentForm.reset();
            }).catch((err) => {
              console.log(err)
            })
          });
        })
      )
      .subscribe(url => {
        if (url) {
          console.log(url);
        }
      });

  }

  /**
   * get studenet list
   */
  getStudentList() {
    this._userService.getStudents().subscribe((data: any) => {
      console.log("all studenet", data)
      this.studentList = data.map((e: any) => {
        return {
          id: e.payload.doc.id,
          isEdit: false,
          name: e.payload.doc.data()['name'],
          age: e.payload.doc.data()['age'],
          address: e.payload.doc.data()['address'],
          image: e.payload.doc.data()['image']
        };
      })
      console.log(this.studentList);
    });
  }

  /**
   * Get SIngle Student
   */
  getSingleStudent() {
    this._userService.getSingleStudent("AS86zNIIhzTiECD48yVP").subscribe((res: any) => {
      this.studentDetail = res.data();
      console.log("single student", this.studentDetail);
    }, err => {
      console.log(err)
    })
  }

  editRecord(data) {
    console.log(data);
    data.isEdit = true;
    data.EditName = data.name;
    data.EditAge = data.age;
    data.EditAddress = data.address;
    data.EditImage = data.image;
  }

  /**
   * Edit details
   * @param {object} data 
   */
  updateRecord(data) {
    this.loading = true;
    if (this.file) {
      var n = Date.now();
      const filePath = `${n}`;
      const fileRef = this.storage.ref(filePath);
      const task = this.storage.upload(`${n}`, this.file);
      console.log(task)
      task
        .snapshotChanges()
        .pipe(
          finalize(() => {
            this.downloadURL = fileRef.getDownloadURL();
            this.downloadURL.subscribe(url => {
              if (url) {
                this.fb = url;
              }
              console.log(this.fb);
              data['image'] = this.fb;
              let record = {};
              record['name'] = data.EditName;
              record['age'] = data.EditAge;
              record['address'] = data.EditAddress;
              record['image'] = this.fb;
              this.storage.storage.refFromURL(data.EditImage).delete();
              this._userService.updateStudentDetail(data.id, record).then((res) => {
                console.log("update res", res);
                this.loading = false;
              }).catch((err) => {
                console.log(err);
                this.loading = false
              })
              data.isEdit = false;
            });
          })
        )
        .subscribe(url => {
          if (url) {
            console.log(url);
          }
        });
    } else {
      let record = {};
      record['name'] = data.EditName;
      record['age'] = data.EditAge;
      record['address'] = data.EditAddress;
      record['image'] = data.EditImage;
      this._userService.updateStudentDetail(data.id, record);
      this.loading = false;
    }

  }

  /**
   * delete student
   */
  removeRecord(data) {
    this._userService.deleteStudent(data.id);
    this.storage.storage.refFromURL(data.image).delete();
  }

  selectFile(e) {
    this.file = e.target.files[0];
    console.log(this.file);
  }
}
