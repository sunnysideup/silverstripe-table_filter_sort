<!doctype html>

<html lang="en">
<head>
  <meta charset="utf-8">
  <title>$Title</title>
</head>

<body id="tfs-modal-pop-up">
<h1>$Title</h1>
<div id="wrapper">
<% if $AddForm %>

    $AddForm

<% else_if $ShareLink  %>

<% else %>
    <main class="tfs-holder">

    <% include TableFilterSortHeader %>

    <% include TableFilterSortTable %>

    <% include TableFilterSortFooter %>
    </main>

<% end_if %>
    </div>
</body>
</html>
