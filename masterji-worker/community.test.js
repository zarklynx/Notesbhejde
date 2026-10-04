import {test} from 'node:test'
import assert from 'node:assert/strict'
import {authorizePath} from './community.js'
test('private paths are scoped to the authenticated user',()=>{
 for(const kind of ['savedNotes','favourites','recentNotes','folders','notifications']) {
  assert.equal(authorizePath(`users/alice/${kind}`,'alice'),true)
  assert.equal(authorizePath(`users/bob/${kind}`,'alice'),false)
 }
 assert.equal(authorizePath('users/alice/folders/extra','alice'),false)
 assert.equal(authorizePath('users/anything/folders','.*'),false)
})
test('only supported public paths are accepted',()=>{
 for(const path of ['publicChat','publicProfiles','chatRooms','chatRooms/abc-123/messages','notes/note123/comments'])assert.equal(authorizePath(path,'alice'),true)
 for(const path of ['notes','users','chatRooms/x/private','notes/x/private','notes/../comments',undefined])assert.equal(authorizePath(path,'alice'),false)
})
