
    # function _calculateMultiplierPoints(uint positionId) internal pure returns (uint attackMultiplier, uint defenseMultiplier, uint moneyMultiplier) {
    #     uint attack = (positionId + 314) % 100;
    #     uint defense = (positionId + 72) % 100;
    #     uint money = (positionId + 39298) % 100;

    #     attackMultiplier = 10;
    #     defenseMultiplier = 10;
    #     moneyMultiplier = 10;
    #     // attack logic
    #     if (attack >= 95) {
    #         attackMultiplier = uint(attackMultiplier + 6 * (attack - 95));
    #     } else if (attack >= 80) {
    #         attackMultiplier = uint(attackMultiplier + attack - 80);
    #     } else if (20 <= attack && attack < 30) {
    #         attackMultiplier = uint(attackMultiplier + attack - 15);
    #     }
    #     // defense logic
    #     if (defense >= 95) {
    #         defenseMultiplier = uint(defenseMultiplier + 6 * (defense - 95));
    #     } else if (attack >= 80) {
    #         defenseMultiplier = uint(defenseMultiplier + defense - 80);
    #     } else if (10 <= defense && defense < 30) {
    #         defenseMultiplier = uint(defenseMultiplier + defense - 5);
    #     }
    #     // money logic
    #     if (money >= 80) {
    #         moneyMultiplier = uint(moneyMultiplier + money - 80);
    #     } else {
    #         moneyMultiplier = uint(moneyMultiplier + money / 10);
    #     }
    #     return (attackMultiplier, defenseMultiplier, moneyMultiplier);
    # }

import pandas as pd

def calculateMultipliers(positionid):
    attack = (positionid + 314) % 100
    defense = (positionid + 72) % 100
    money = (positionid + 39298) % 100

    attackMultiplier = 10
    defenseMultiplier = 10
    moneyMultiplier = 10
    # attack logic
    if attack >= 95:
        attackMultiplier = attackMultiplier + 6 * (attack - 95)
    elif attack >= 80:
        attackMultiplier = attackMultiplier + attack - 80
    elif 20 <= attack and attack < 30:
        attackMultiplier = attackMultiplier + attack - 15
    # defense logic
    if defense >= 95:
        defenseMultiplier = defenseMultiplier + 6 * (defense - 95)
    elif attack >= 80:
        defenseMultiplier = defenseMultiplier + defense - 80
    elif 10 <= defense and defense < 30:
        defenseMultiplier = defenseMultiplier + defense - 5
    # money logic
    if money >= 80:
        moneyMultiplier = moneyMultiplier + money - 80
    else:
        moneyMultiplier = moneyMultiplier + money / 10

    # little fix as solidity doesnt know floats
    attackMultiplier, defenseMultiplier, moneyMultiplier = int(attackMultiplier), int(defenseMultiplier), int(moneyMultiplier)

    return (attackMultiplier, defenseMultiplier, moneyMultiplier)


store = []
for i in range(10000):
    attack, defense, money = calculateMultipliers(i)
    # these values actually represent floats, shifting /10 would be the plan to get it
    # print(f"{i} {attack} {defense} {money}")
    store.append([i, attack, defense, money])
df = pd.DataFrame(store, columns = ['positionid', 'attack', 'defense', 'money'])
# df.to_csv('multipliers.csv', index=False)

# the 75th percentile for 
#   attack is: 13
#   defense is: 10
#   money is: 16
# the 25th percentile for 
#  attack is: 10
#  defense is: 10
#  money is: 12
# legendary is:
#  attack is: 34
#  defense is: 34
#  money is: 29

bads = []
normals = []
goods = []
rares = []
legendaries = []

for i in range(len(df)):
    pos, attack, defense, money = df.iloc[i]
    if attack == 34 or defense == 34 or money == 29:
        legendaries.append(pos)
    elif attack >= 10 and defense > 10 and money >= 12:
        rares.append(pos)
    elif attack > 13 or defense > 10 or money > 16:
        goods.append(pos)
    elif attack > 10 or defense > 10 or money > 12:
        normals.append(pos)
    else:
        bads.append(pos)

print(f"legendaries: {len(legendaries)}")
print(f"rares: {len(rares)}")
print(f"goods: {len(goods)}")
print(f"normals: {len(normals)}")
print(f"bads: {len(bads)}")

df["rarity"] = None
df.loc[legendaries, "rarity"] = "legendary"
df.loc[rares, "rarity"] = "rare"
df.loc[goods, "rarity"] = "good"
df.loc[normals, "rarity"] = "normal"
df.loc[bads, "rarity"] = "bad"

# fix the decimal
df["attack"] = df["attack"].apply(lambda x: x / 10)
df["defense"] = df["defense"].apply(lambda x: x / 10)
df["money"] = df["money"].apply(lambda x: x / 10)

df.to_csv("multipliers.csv", index=False)