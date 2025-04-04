---
title: 【JS设计模式】中介者模式
categories:
  - JS设计模式
tags:
  - JavaScript
date: 2020-09-06 15:24:07
---
## 中介者模式

中介者模式的定义：

> 中介者模式的作用就是解除对象与对象之间的耦合关系。增加一个中介者对象后，所有的相关对象都通过中介者对象来通信，而不是互相引用。中介者使各个对象之间的耦合松散，而且可以独立地改变他们之间的交互。中介者模式使网状的多对多关系变成了相对简单的一对多关系。

### 举个例子 —— 泡泡堂游戏

定义一个玩家类，它包含三个方法`win`、`lose`和`die`，当设定的玩家数目为2名时，其中一位玩家死亡则游戏结束，同时通知它的对手胜利：

```js
class Player {
  constructor (name) {
    this.name = name
    this.enemy = null // 敌人
  }
  
  win () {
    console.log('winner: ' + this.name)
  }
  
  lose () {
    console.log('loser: ' + this.name)
  }
  
  die () {
    this.lose()
    this.enemy.win()
  }
}
```

```js
const player1 = new Player('one')
const player2 = new Player('two')

player1.enemy = player2
player2.enemy = player1

player1.die() // winner: two  loser: one
```

**▼游戏玩法升级**

此时，我们想让玩家的数量增加到8个人，并且分成两个小队，因此我们需要改造我们的`Player`类：



```js
class Player {
  constructor (name, teamColor) {
    this.partners = [] // 队友列表
    this.enemies = [] // 敌人列表
    this.state = 'alive' // 玩家状态
    this.name = name
    this.teamColor = teamColor
  }
  
  win () {
    console.log('winner: ' + this.name)
  }
  
  lose () {
    console.log('loser: ' + this.name)
  }
  
  die () {
    let all_dead = true
    this.state = 'dead' // 设置玩家状态为死亡
    
    for (let i = 0, partner; partner = this.partners[ i++ ];) {
      if (partner.state !== 'dead') { // 如果还有一个队友没有死亡，则游戏还未结束
        all_dead = false
        break
      }
    }
    
    if (all_dead) { // 如果队友全部死亡
      this.lose() // 通知自己游戏失败
      for (let i = 0, partner; partner = this.partners[ i++ ];) {
        // 通知所有队友游戏失败
        partner.lose()
      }
      
      for (let i = 0, enemy; enemy = this.enemies[ i++ ];) {
        // 通知所有敌人游戏成功
        enemy.win()
      }
    }
  }
}
```

```js
// 定义一个工厂来创造玩家
const playerFactory = (function () {
  const players = []
  return function (name, teamColor) {
    var newPlayer = new Player (name, teamColor) // 创建新玩家

    for (let i = 0, player; player = players[ i++ ];) { // 通知所有的玩家，有新的角色加入
      if (player.teamColor === newPlayer.teamColor) {
        // 如果是同一队的玩家，互相添加到队友列表
        player.partners.push(newPlayer)
        newPlayer.partners.push(player)
      } else {
        // 相互添加到敌人列表
        player.enemies.push(newPlayer)
        newPlayer.enemies.push(player)
      }
    }
    players.push(newPlayer)
    return newPlayer
  }
})()
```

```js
// 红队：
const player1 = playerFactory('1', 'red')
const player2 = playerFactory('2', 'red')
const player3 = playerFactory('3', 'red')
const player4 = playerFactory('4', 'red')
// 蓝队：
const player5 = playerFactory('5', 'blue')
const player6 = playerFactory('6', 'blue')
const player7 = playerFactory('7', 'blue')
const player8 = playerFactory('8', 'blue')
// 让红队玩家全部死亡：
player1.die()
player2.die()
player3.die()
player4.die()
/*
loser: 4
loser: 1
loser: 2
loser: 3
winner: 5
winner: 6
winner: 7
winner: 8
*/
```

现在我们已经可以随意地为游戏增加玩家和队伍，但是由于玩家与玩家之间都是紧密耦合在一起的，当有玩家死亡时，都必须显示地遍历通知其他对象。在例子中其实还不难操作，但是如果是一个有成百上千人的玩家队伍中，有一个玩家掉线，那么就必须遍历其他所有玩家的队友列表和敌人列表去移除这位玩家。又或者其中一位玩家从红队变成蓝队，这样的操作都会使得代码变得特别的复杂。

**▼使用中介者模式重构**

```js
class Player {
  constructor (name, teamColor) {
    this.name = name
    this.teamColor = teamColor
    this.state = 'alive' // 玩家状态
  }
  
  win () {
    console.log('winner: ' + this.name)
  }
  
  lose () {
    console.log('loser: ' + this.name)
  }
  
  die () {
    this.state = 'dead'
    playerDirector.reciveMessage('playerDead', this) // 给中介者发送消息，玩家死亡
  }
  
  remove () {
    playerDirector.reciveMessage('removePlayer', this) // 给中介者发送消息，移除一个玩家
  }
  
  changeTeam (color) {
    playerDirector.reciveMessage('changeTeam', this, color) // 给中介者发送消息，玩家换队
  }
}
```

```js
// 玩家工厂
const playerFactory = function (name, teamColor) {
  const newPlayer = new Player(name, teamColor) // 创建一个新的玩家
  playerDirector.reciveMessage('addPlayer', newPlayer) // 给中介者发送消息，新增玩家
  return newPlayer
}
```

```js
const playerDirector = (function () {
  const players = {} // 保存所有的玩家
  const operatons = {} // 中介者可执行的操作
  
  operatons.addPlayer = function (player) {
    const teamColor = player.teamColor
    players[ teamColor ] = players[ teamColor ] || []
    players[ teamColor ].push(player)
  }
  
  operatons.removePlayer = function (player) {
    const teamColor = player.teamColor
    const teamPlayers = players[ teamColor ] || []
    for (let i = teamPlayers.length - 1; i >= 0; i--) {
      if (teamPlayers[i] === player) {
        teamPlayers.splice(i, 1)
      }
    }
  }
  
  operatons.changeTeam = function (player, newTeamColor) {
    operatons.removePlayer(player)
    player.teamColor = newTeamColor
    operatons.addPlayer(player)
  }
  
  operatons.playerDead = function (player) {
    const teamColor = player.teamColor
    const teamPlayers = players[ teamColor ] || []
    let all_dead = true
    
    for (let i = 0, player; player = teamPlayers[ i++ ];) {
      if (player.state !== 'dead') {
        all_dead = false
        break
      }
    }
    
    if (all_dead) {
      for (let i = 0, player; player = teamPlayers[ i++ ];) {
        player.lose()
      }
      
      for (let color in players) {
        if (color !== teamColor) {
          const teamPlayers = players[color]
          for (let i = 0, player; player = teamPlayers[ i++ ];) {
            player.win()
          }
        }
      }
    }
  }
  
  var reciveMessage = function () {
    var message = Array.prototype.shift.call(arguments)
    operatons[message].apply(this, arguments)
  }
  
  return {
    reciveMessage
  }
})()
```

可以看到，除了中介者本身，没有一个玩家知道其他任何玩家的存在，玩家与玩家之间的耦合关系完全解除，某个玩家的任何操作都不需要通知其他玩家，而只需要给中介者发送一个消息，中介者处理完消息之后会把处理的结果反馈给其他玩家对象。我们还可以继续给中介者扩展更多的功能，以适应游戏需求的不断变化。

## 总结

### 优缺点

* 优点：
  * 使各个对象之间得以解耦，，以中介者和对象之间的一对多关系取代了对象之间的网状多对多关系
  * 使得**对象只需要关注自身功能的实现**
  * 对象之间的**交互关系交给了中介者对象来实现和维护**
* 缺点：
  * 系统中会新增一个中介者对象，原本对象之间交互的复杂性会转移成中介者对象的复杂性，使得**中介者对象十分巨大难以维护**



中介者模式可以非常方便地对模块或对象进行解耦，但**对象之间并非一定需要解耦**。在实际项目中，模块或对象之间有一些以来关系是很正常的。因此可以看情况使用中介者模式。



文章参考：
《JavaScript设计模式与开发实践》