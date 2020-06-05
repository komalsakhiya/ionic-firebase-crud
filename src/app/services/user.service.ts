import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  collectionName = 'Students';

  constructor(
    public firestore: AngularFirestore
  ) { }

  /**
   *Create Student
   */
  createStudent(record) {
    return this.firestore.collection(this.collectionName).add(record);
  }


  getStudents() {
    return this.firestore.collection(this.collectionName).snapshotChanges();
  }

  /**
   * Update student record
   * @param {object} data 
   */
  updateStudentDetail(id, data) {
    this.firestore.doc(this.collectionName + '/' + id).update(data);
  }

  /**
   * Delete Student
   * @param {string} id 
   */
  deleteStudent(id) {
    this.firestore.doc(this.collectionName + '/' + id).delete();
  }

  /**
   * Get single record
   */
  getSingleStudent(id) {
   return this.firestore.doc(this.collectionName + '/' +id).get();
  }
}
