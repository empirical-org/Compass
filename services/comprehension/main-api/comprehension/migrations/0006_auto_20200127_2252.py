# Generated by Django 2.2.5 on 2020-01-27 22:52

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('comprehension', '0005_rule_ruleset'),
    ]

    operations = [
        migrations.AddField(
            model_name='mlfeedback',
            name='order',
            field=models.PositiveIntegerField(default=1),
        ),
        migrations.AlterUniqueTogether(
            name='mlfeedback',
            unique_together={('prompt', 'combined_labels', 'order')},
        ),
    ]
