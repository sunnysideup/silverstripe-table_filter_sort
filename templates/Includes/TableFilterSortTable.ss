<% if MyList %>
<table class="tableFilterSortTable">
    <thead>
        <tr>
            <th scope="col">
                <a href="#" class="sortable" data-sort-field="Title" data-sort-direction="asc" data-sort-type="string">Title</a>
            </th>
            <th scope="col">
                Author
            </th>
            <th scope="col">
                Description
            </th>
            <th scope="col">
                Tags
            </th>
        </tr>
    </thead>



<tbody>
    <% loop MyList %>
<tr class="tfsRow hide" id="tfs$ID">
<td>
    <a href="$URLSegment" class="load">
        <span data-filter="Title">$Title</span>
    </a>
</td>
<td>
    <span data-filter="Author" class="dl">$Author</span>
</td>
<td>$Description</td>
<td><% if Tags %><% loop Tags %><% if $Last && $First = false %> and <% end_if %><span data-filter="Tags" class="dl">$Title</span><% if Last %>.<% else %>, <% end_if %><% end_loop %><% else %><span data-filter="Tags">$Title</span><% end_if %></td>
</tr>
    <% end_loop %>
</tbody>


</table>

<% else %>
    <p class="no-matches-message">Sorry, no data is currently available.</p>
<% end_if %>
